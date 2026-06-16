import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShiftPatternDto } from './dto/create-shift-pattern.dto';
import { UpdateShiftPatternDto } from './dto/update-shift-pattern.dto';

@Injectable()
export class ShiftPatternsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(currentUser: User) {
    // Ordered by sort_order ascending
    return this.prisma.shiftPattern.findMany({
      where: { userId: currentUser.id },
      orderBy: { sortOrder: 'asc' },
    });
  }

  create(dto: CreateShiftPatternDto, currentUser: User) {
    return this.prisma.shiftPattern.create({
      data: {
        userId: currentUser.id,
        name: dto.name,
        color: dto.color,
        startTime: dto.startTime ?? null,
        endTime: dto.endTime ?? null,
        breakMinutes: dto.breakMinutes ?? 0,
        isDayOff: dto.isDayOff ?? false,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async findOne(id: string, currentUser: User) {
    const pattern = await this.prisma.shiftPattern.findUnique({ where: { id } });
    if (!pattern) {
      throw new NotFoundException('ShiftPattern not found');
    }
    if (pattern.userId !== currentUser.id) {
      throw new ForbiddenException('You can only view your own shift patterns');
    }
    return pattern;
  }

  async update(id: string, dto: UpdateShiftPatternDto, currentUser: User) {
    const pattern = await this.prisma.shiftPattern.findUnique({ where: { id } });
    if (!pattern) {
      throw new NotFoundException('ShiftPattern not found');
    }
    if (pattern.userId !== currentUser.id) {
      throw new ForbiddenException('You can only update your own shift patterns');
    }
    return this.prisma.shiftPattern.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.startTime !== undefined && { startTime: dto.startTime }),
        ...(dto.endTime !== undefined && { endTime: dto.endTime }),
        ...(dto.breakMinutes !== undefined && { breakMinutes: dto.breakMinutes }),
        ...(dto.isDayOff !== undefined && { isDayOff: dto.isDayOff }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  async remove(id: string, currentUser: User) {
    const pattern = await this.prisma.shiftPattern.findUnique({ where: { id } });
    if (!pattern) {
      throw new NotFoundException('ShiftPattern not found');
    }
    if (pattern.userId !== currentUser.id) {
      throw new ForbiddenException('You can only delete your own shift patterns');
    }
    await this.prisma.shiftPattern.delete({ where: { id } });
  }
}
