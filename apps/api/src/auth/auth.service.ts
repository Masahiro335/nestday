import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'crypto';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

function toUserResponse(user: User) {
  const { passwordHash: _pw, ...safe } = user;
  return safe;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService,
  ) {}

  async register(dto: RegisterDto) {
    const client = this.supabase.getClient();

    const { data, error } = await client.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
    });

    if (error) {
      // Supabase returns "User already registered" for duplicate emails
      if (error.message.toLowerCase().includes('already')) {
        throw new BadRequestException('Email already in use');
      }
      throw new BadRequestException(error.message);
    }

    // Store a hash locally to satisfy the NOT NULL constraint.
    // Actual authentication is delegated to Supabase Auth.
    const passwordHash = createHash('sha256').update(dto.password).digest('hex');

    const user = await this.prisma.user.create({
      data: {
        id: data.user.id,
        email: dto.email,
        passwordHash,
        name: dto.name ?? null,
      },
    });

    return toUserResponse(user);
  }

  async login(dto: LoginDto) {
    const client = this.supabase.getClient();

    const { data, error } = await client.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error || !data.session) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: data.user.id },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      user: toUserResponse(user),
      token: data.session.access_token,
    };
  }
}
