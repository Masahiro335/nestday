import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

function toUserResponse(user: User) {
  const { passwordHash: _pw, ...safe } = user;
  return safe;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService,
  ) {}

  async getMe(currentUser: User) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: currentUser.id },
    });
    return toUserResponse(user);
  }

  async updateMe(currentUser: User, dto: UpdateProfileDto) {
    const client = this.supabase.getClient();

    if (dto.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existing && existing.id !== currentUser.id) {
        throw new ConflictException('このメールアドレスはすでに使用されています');
      }
    }

    if (dto.email || dto.password) {
      const supabaseUpdate: { email?: string; password?: string; email_confirm?: boolean } = {};
      if (dto.email) {
        supabaseUpdate.email = dto.email;
        supabaseUpdate.email_confirm = true;
      }
      if (dto.password) supabaseUpdate.password = dto.password;

      const { error } = await client.auth.admin.updateUserById(currentUser.id, supabaseUpdate);
      if (error) throw new BadRequestException(error.message);
    }

    const prismaData: { name?: string; memo?: string; email?: string } = {};
    if (dto.name !== undefined) prismaData.name = dto.name;
    if (dto.memo !== undefined) prismaData.memo = dto.memo;
    if (dto.email !== undefined) prismaData.email = dto.email;

    if (Object.keys(prismaData).length > 0) {
      const user = await this.prisma.user.update({
        where: { id: currentUser.id },
        data: prismaData,
      });
      return toUserResponse(user);
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: currentUser.id },
    });
    return toUserResponse(user);
  }

  async deleteMe(currentUser: User) {
    const client = this.supabase.getClient();

    // グループオーナーの場合は退会不可
    const ownedGroup = await this.prisma.group.findFirst({
      where: { ownerId: currentUser.id },
    });
    if (ownedGroup) {
      throw new BadRequestException('グループオーナーはアカウントを削除できません。先にグループを解散するか、オーナーを他のメンバーに移譲してください。');
    }

    await this.prisma.$transaction([
      // Shift → ShiftPattern → Event → Calendar → GroupMember → User の順で削除
      this.prisma.shift.deleteMany({ where: { userId: currentUser.id } }),
      this.prisma.shiftPattern.deleteMany({ where: { userId: currentUser.id } }),
      this.prisma.event.deleteMany({ where: { createdBy: currentUser.id } }),
      this.prisma.calendar.deleteMany({ where: { createdBy: currentUser.id } }),
      this.prisma.groupMember.deleteMany({ where: { userId: currentUser.id } }),
      this.prisma.user.delete({ where: { id: currentUser.id } }),
    ]);

    // Supabase Authからも削除
    const { error } = await client.auth.admin.deleteUser(currentUser.id);
    if (error) throw new BadRequestException(error.message);
  }
}
