import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AssignShiftDto } from './dto/assign-shift.dto';
import { GetEventsQueryDto } from '../events/dto/get-events-query.dto';

const shiftInclude = {
  include: {
    shiftPattern: true,
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    },
  },
} as const;

@Injectable()
export class ShiftsService {
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

  private formatShiftDate<T extends { date: Date }>(shift: T): Omit<T, 'date'> & { date: string } {
    return { ...shift, date: shift.date.toISOString().slice(0, 10) };
  }

  async findAll(query: GetEventsQueryDto, currentUser: User) {
    const groupIds = await this.getGroupIds(currentUser.id);
    const targetGroupIds = query.groupId ? [query.groupId] : groupIds;

    const [year, month] = query.month.split('-').map(Number);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);

    const shifts = await this.prisma.shift.findMany({
      where: {
        groupId: { in: targetGroupIds },
        date: { gte: monthStart, lte: monthEnd },
      },
      ...shiftInclude,
      orderBy: [{ date: 'asc' }, { userId: 'asc' }],
    });
    return shifts.map((s) => this.formatShiftDate(s));
  }

  async assign(date: string, dto: AssignShiftDto, currentUser: User) {
    const groupId = await this.getGroupId(currentUser.id);
    const parsedDate = new Date(date);

    const shift = await this.prisma.shift.upsert({
      where: {
        userId_date: {
          userId: currentUser.id,
          date: parsedDate,
        },
      },
      create: {
        userId: currentUser.id,
        groupId,
        shiftPatternId: dto.shiftPatternId,
        date: parsedDate,
      },
      update: {
        shiftPatternId: dto.shiftPatternId,
      },
      ...shiftInclude,
    });
    return this.formatShiftDate(shift);
  }

  async remove(date: string, currentUser: User) {
    await this.getGroupId(currentUser.id);
    const parsedDate = new Date(date);

    const shift = await this.prisma.shift.findUnique({
      where: {
        userId_date: {
          userId: currentUser.id,
          date: parsedDate,
        },
      },
    });
    if (!shift) {
      throw new NotFoundException('シフトが見つかりません');
    }
    await this.prisma.shift.delete({
      where: { userId_date: { userId: currentUser.id, date: parsedDate } },
    });
  }
}
