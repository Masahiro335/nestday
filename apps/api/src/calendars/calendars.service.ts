import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';

@Injectable()
export class CalendarsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getGroupId(userId: string): Promise<string> {
    const membership = await this.prisma.groupMember.findFirst({
      where: { userId },
    });
    if (!membership) {
      throw new NotFoundException('グループが見つかりません');
    }
    return membership.groupId;
  }

  private async getGroupIds(userId: string): Promise<string[]> {
    const memberships = await this.prisma.groupMember.findMany({
      where: { userId },
    });
    if (memberships.length === 0) {
      throw new NotFoundException('グループが見つかりません');
    }
    return memberships.map((m) => m.groupId);
  }

  async findAll(currentUser: User, groupId?: string) {
    const groupIds = await this.getGroupIds(currentUser.id);
    const targetIds = groupId
      ? groupIds.filter((id) => id === groupId)
      : groupIds;
    return this.prisma.calendar.findMany({
      where: { groupId: { in: targetIds } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(dto: CreateCalendarDto, currentUser: User) {
    let groupId: string;
    if (dto.groupId) {
      const groupIds = await this.getGroupIds(currentUser.id);
      if (!groupIds.includes(dto.groupId)) {
        throw new ForbiddenException('このグループのメンバーではありません');
      }
      groupId = dto.groupId;
    } else {
      groupId = await this.getGroupId(currentUser.id);
    }
    return this.prisma.calendar.create({
      data: {
        groupId,
        name: dto.name,
        color: dto.color,
        createdBy: currentUser.id,
      },
    });
  }

  async update(id: string, dto: UpdateCalendarDto, currentUser: User) {
    const calendar = await this.prisma.calendar.findUnique({ where: { id } });
    if (!calendar) {
      throw new NotFoundException('カレンダーが見つかりません');
    }
    const groupIds = await this.getGroupIds(currentUser.id);
    if (!groupIds.includes(calendar.groupId)) {
      throw new ForbiddenException('このグループのメンバーではありません');
    }
    if (calendar.createdBy !== currentUser.id) {
      throw new ForbiddenException('作成者のみ編集できます');
    }
    return this.prisma.calendar.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.color !== undefined && { color: dto.color }),
      },
    });
  }

  async remove(id: string, currentUser: User) {
    const calendar = await this.prisma.calendar.findUnique({ where: { id } });
    if (!calendar) {
      throw new NotFoundException('カレンダーが見つかりません');
    }
    const groupIds = await this.getGroupIds(currentUser.id);
    if (!groupIds.includes(calendar.groupId)) {
      throw new ForbiddenException('このグループのメンバーではありません');
    }
    if (calendar.createdBy !== currentUser.id) {
      throw new ForbiddenException('作成者のみ削除できます');
    }
    await this.prisma.calendar.delete({ where: { id } });
  }
}
