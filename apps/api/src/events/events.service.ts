import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { GetEventsQueryDto } from './dto/get-events-query.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
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

  async findOne(id: string, currentUser: User) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');

    const groupId = await this.getGroupId(currentUser.id);
    if (event.groupId !== groupId) throw new ForbiddenException('Access denied');

    return event;
  }

  async findAll(query: GetEventsQueryDto, currentUser: User) {
    const groupId = await this.getGroupId(currentUser.id);

    const [year, month] = query.month.split('-').map(Number);
    // Filter: start_at <= monthEnd AND end_at >= monthStart
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

    return this.prisma.event.findMany({
      where: {
        groupId,
        startAt: { lte: monthEnd },
        endAt: { gte: monthStart },
      },
      orderBy: { startAt: 'asc' },
    });
  }

  async create(dto: CreateEventDto, currentUser: User) {
    const groupId = await this.getGroupId(currentUser.id);
    return this.prisma.event.create({
      data: {
        groupId,
        calendarId: dto.calendarId,
        createdBy: currentUser.id,
        title: dto.title,
        memo: dto.memo,
        location: dto.location,
        color: dto.color,
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
        isAllDay: dto.isAllDay ?? false,
      },
    });
  }

  async update(id: string, dto: UpdateEventDto, currentUser: User) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.createdBy !== currentUser.id) {
      throw new ForbiddenException('You can only edit your own events');
    }
    return this.prisma.event.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.memo !== undefined && { memo: dto.memo }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.startAt !== undefined && { startAt: new Date(dto.startAt) }),
        ...(dto.endAt !== undefined && { endAt: new Date(dto.endAt) }),
        ...(dto.isAllDay !== undefined && { isAllDay: dto.isAllDay }),
      },
    });
  }

  async remove(id: string, currentUser: User) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.createdBy !== currentUser.id) {
      throw new ForbiddenException('You can only delete your own events');
    }
    await this.prisma.event.delete({ where: { id } });
  }
}
