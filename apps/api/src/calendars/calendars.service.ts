import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findAll(currentUser: User) {
    const groupIds = await this.getGroupIds(currentUser.id);
    return this.prisma.calendar.findMany({
      where: { groupId: { in: groupIds } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(dto: CreateCalendarDto, currentUser: User) {
    const groupId = await this.getGroupId(currentUser.id);
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
    await this.getGroupId(currentUser.id);
    const calendar = await this.prisma.calendar.findUnique({ where: { id } });
    if (!calendar) {
      throw new NotFoundException('Calendar not found');
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
    await this.getGroupId(currentUser.id);
    const calendar = await this.prisma.calendar.findUnique({ where: { id } });
    if (!calendar) {
      throw new NotFoundException('Calendar not found');
    }
    await this.prisma.calendar.delete({ where: { id } });
  }
}
