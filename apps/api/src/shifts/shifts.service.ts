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

    // Remove patterns not in the new list
    await this.prisma.shift.deleteMany({
      where: {
        userId: currentUser.id,
        date: parsedDate,
        shiftPatternId: { notIn: dto.shiftPatternIds },
      },
    });

    // Upsert each selected pattern
    for (const shiftPatternId of dto.shiftPatternIds) {
      await this.prisma.shift.upsert({
        where: {
          userId_date_shiftPatternId: {
            userId: currentUser.id,
            date: parsedDate,
            shiftPatternId,
          },
        },
        create: {
          userId: currentUser.id,
          groupId,
          shiftPatternId,
          date: parsedDate,
        },
        update: {},
      });
    }

    const shifts = await this.prisma.shift.findMany({
      where: { userId: currentUser.id, date: parsedDate },
      ...shiftInclude,
    });
    return shifts.map((s) => this.formatShiftDate(s));
  }

  async remove(date: string, currentUser: User) {
    await this.getGroupId(currentUser.id);
    const parsedDate = new Date(date);
    await this.prisma.shift.deleteMany({
      where: { userId: currentUser.id, date: parsedDate },
    });
  }
}
