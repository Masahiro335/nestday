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
    const membership = await this.prisma.groupMember.findUnique({
      where: { userId },
    });
    if (!membership) {
      throw new NotFoundException('Group not found');
    }
    return membership.groupId;
  }

  async findAll(query: GetEventsQueryDto, currentUser: User) {
    const groupId = await this.getGroupId(currentUser.id);

    const [year, month] = query.month.split('-').map(Number);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);

    // Fetch all shifts for groupId in the month, include shift_pattern nested
    return this.prisma.shift.findMany({
      where: {
        groupId,
        date: { gte: monthStart, lte: monthEnd },
      },
      ...shiftInclude,
      orderBy: [{ date: 'asc' }, { userId: 'asc' }],
    });
  }

  async assign(date: string, dto: AssignShiftDto, currentUser: User) {
    const groupId = await this.getGroupId(currentUser.id);
    const parsedDate = new Date(date);

    // upsert by userId + date unique constraint
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
