import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

function toUserResponse(user: User) {
  const { passwordHash: _pw, ...safe } = user;
  return safe;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(currentUser: User) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: currentUser.id },
    });
    return toUserResponse(user);
  }

  async updateMe(currentUser: User, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: currentUser.id },
      data: {
        ...(dto.memo !== undefined && { memo: dto.memo }),
        ...(dto.name !== undefined && { name: dto.name }),
      },
    });
    return toUserResponse(user);
  }
}
