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
      throw new NotFoundException('Group not found');
    }
    return membership.groupId;
  }

  private async getGroupIds(userId: string): Promise<string[]> {
    const memberships = await this.prisma.groupMember.findMany({
      where: { userId },
    });
    if (memberships.length === 0) {
      throw new NotFoundException('Group not found');
    }
    return memberships.map((m) => m.groupId);
  }

  async findAll(query: GetEventsQueryDto, currentUser: User) {
    const groupIds = await this.getGroupIds(currentUser.id);

    const [year, month] = query.month.split('-').map(Number);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);

    return this.prisma.shift.findMany({
      where: {
        groupId: { in: groupIds },
        date: { gte: monthStart, lte: monthEnd },
      },
      ...shiftInclude,
      orderBy: [{ date: 'asc' }, { userId: 'asc' }],
    });
  }

  async assign(date: string, dto: AssignShiftDto, currentUser: User) {
    const groupId = await this.getGroupId(currentUser.id);
    const parsedDate = new Date(date);

    return this.prisma.shift.upsert({
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
      throw new NotFoundException('Shift not found');
    }
    await this.prisma.shift.delete({
      where: { userId_date: { userId: currentUser.id, date: parsedDate } },
    });
  }
}
