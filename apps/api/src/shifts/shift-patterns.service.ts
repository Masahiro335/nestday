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

  async create(dto: CreateShiftPatternDto, currentUser: User) {
    let sortOrder = dto.sortOrder;
    if (sortOrder === undefined) {
      const agg = await this.prisma.shiftPattern.aggregate({
        where: { userId: currentUser.id },
        _max: { sortOrder: true },
      });
      sortOrder = (agg._max.sortOrder ?? -1) + 1;
    }
    return this.prisma.shiftPattern.create({
      data: {
        userId: currentUser.id,
        name: dto.name,
        color: dto.color,
        startTime: dto.startTime ?? null,
        endTime: dto.endTime ?? null,
        breakMinutes: dto.breakMinutes ?? 0,
        isDayOff: dto.isDayOff ?? false,
        sortOrder,
      },
    });
  }

  async findOne(id: string, currentUser: User) {
    const pattern = await this.prisma.shiftPattern.findUnique({ where: { id } });
    if (!pattern) {
      throw new NotFoundException('シフトパターンが見つかりません');
    }
    if (pattern.userId !== currentUser.id) {
      throw new ForbiddenException('自分のシフトパターンのみ参照できます');
    }
    return pattern;
  }

  async update(id: string, dto: UpdateShiftPatternDto, currentUser: User) {
    const pattern = await this.prisma.shiftPattern.findUnique({ where: { id } });
    if (!pattern) {
      throw new NotFoundException('シフトパターンが見つかりません');
    }
    if (pattern.userId !== currentUser.id) {
      throw new ForbiddenException('自分のシフトパターンのみ更新できます');
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
      throw new NotFoundException('シフトパターンが見つかりません');
    }
    if (pattern.userId !== currentUser.id) {
      throw new ForbiddenException('自分のシフトパターンのみ削除できます');
    }
    await this.prisma.shiftPattern.delete({ where: { id } });
  }
}
