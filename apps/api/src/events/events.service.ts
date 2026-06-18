import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { GetEventsQueryDto } from './dto/get-events-query.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  /** ユーザーが所属する最初のグループIDを返す（グループ未所属は NotFoundException） */
  private async getGroupId(userId: string): Promise<string> {
    const membership = await this.prisma.groupMember.findFirst({
      where: { userId },
    });
    if (!membership) {
      throw new NotFoundException('Group not found');
    }
    return membership.groupId;
  }

  /** ユーザーが所属する全グループIDを返す（グループ未所属は NotFoundException） */
  private async getGroupIds(userId: string): Promise<string[]> {
    const memberships = await this.prisma.groupMember.findMany({
      where: { userId },
    });
    if (memberships.length === 0) {
      throw new NotFoundException('Group not found');
    }
    return memberships.map((m) => m.groupId);
  }

  /** グループ所属チェックのみ（グループ内外は問わない） */
  private async requireGroupMembership(userId: string): Promise<void> {
    const count = await this.prisma.groupMember.count({ where: { userId } });
    if (count === 0) throw new NotFoundException('Group not found');
  }

  async findOne(id: string, currentUser: User) {
    await this.requireGroupMembership(currentUser.id);
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async findAll(query: GetEventsQueryDto, currentUser: User) {
    const groupIds = await this.getGroupIds(currentUser.id);
    const targetGroupIds = query.groupId ? [query.groupId] : groupIds;

    const [year, month] = query.month.split('-').map(Number);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

    return this.prisma.event.findMany({
      where: {
        groupId: { in: targetGroupIds },
        startAt: { lte: monthEnd },
        endAt: { gte: monthStart },
      },
      orderBy: { startAt: 'asc' },
    });
  }

  async create(dto: CreateEventDto, currentUser: User) {
    const calendar = await this.prisma.calendar.findUnique({ where: { id: dto.calendarId } });
    if (!calendar) throw new BadRequestException('Calendar not found');

    const groupIds = await this.getGroupIds(currentUser.id);
    if (!groupIds.includes(calendar.groupId)) {
      throw new ForbiddenException('Not a member of this group');
    }

    return this.prisma.event.create({
      data: {
        groupId: calendar.groupId,
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
