import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';

const memberInclude = {
  include: {
    members: {
      include: { user: true },
    },
  },
} as const;

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateGroupDto, currentUser: User) {
    const group = await this.prisma.group.create({
      data: {
        name: dto.name,
        inviteToken: uuidv4(),
        ownerId: currentUser.id,
        members: {
          create: { userId: currentUser.id },
        },
      },
      ...memberInclude,
    });
    return this.formatGroup(group);
  }

  async getMyGroup(currentUser: User) {
    const membership = await this.prisma.groupMember.findUnique({
      where: { userId: currentUser.id },
    });
    if (!membership) {
      throw new NotFoundException('Group not found');
    }

    const group = await this.prisma.group.findUnique({
      where: { id: membership.groupId },
      ...memberInclude,
    });
    return this.formatGroup(group!);
  }

  async getGroupPreview(token: string) {
    const group = await this.prisma.group.findUnique({
      where: { inviteToken: token },
      include: { _count: { select: { members: true } } },
    });
    if (!group) {
      throw new NotFoundException('Invalid invite token');
    }
    return {
      id: group.id,
      name: group.name,
      memberCount: group._count.members,
    };
  }

  async joinGroup(token: string, currentUser: User) {
    const group = await this.prisma.group.findUnique({
      where: { inviteToken: token },
    });
    if (!group) {
      throw new NotFoundException('Invalid invite token');
    }

    const existing = await this.prisma.groupMember.findUnique({
      where: { userId: currentUser.id },
    });
    if (existing) {
      throw new ConflictException('Already a member of a group');
    }

    await this.prisma.groupMember.create({
      data: { groupId: group.id, userId: currentUser.id },
    });

    const updated = await this.prisma.group.findUnique({
      where: { id: group.id },
      ...memberInclude,
    });
    return this.formatGroup(updated!);
  }

  private formatGroup(
    group: Awaited<ReturnType<typeof this.prisma.group.findUnique>> & {
      members: { user: User; id: string; groupId: string; userId: string; joinedAt: Date }[];
    },
  ) {
    return {
      id: group!.id,
      name: group!.name,
      inviteToken: group!.inviteToken,
      ownerId: group!.ownerId,
      createdAt: group!.createdAt,
      updatedAt: group!.updatedAt,
      members: group!.members.map((m) => ({
        id: m.user.id,
        email: m.user.email,
        name: m.user.name,
        avatarUrl: m.user.avatarUrl,
        createdAt: m.user.createdAt,
        updatedAt: m.user.updatedAt,
        joinedAt: m.joinedAt,
      })),
    };
  }
}
