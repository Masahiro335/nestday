import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoListDto } from './dto/create-todo-list.dto';
import { UpdateTodoListDto } from './dto/update-todo-list.dto';

@Injectable()
export class TodoListsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getGroupId(userId: string): Promise<string> {
    const membership = await this.prisma.groupMember.findFirst({
      where: { userId },
    });
    if (!membership) throw new NotFoundException('グループが見つかりません');
    return membership.groupId;
  }

  async findAll(currentUser: User) {
    const groupId = await this.getGroupId(currentUser.id);
    return this.prisma.todoList.findMany({
      where: { groupId },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(dto: CreateTodoListDto, currentUser: User) {
    const groupId = await this.getGroupId(currentUser.id);
    return this.prisma.todoList.create({
      data: {
        groupId,
        createdBy: currentUser.id,
        name: dto.name,
        color: dto.color ?? '#3b82f6',
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async update(id: string, dto: UpdateTodoListDto, currentUser: User) {
    const list = await this.prisma.todoList.findUnique({ where: { id } });
    if (!list) throw new NotFoundException('リストが見つかりません');
    if (list.createdBy !== currentUser.id) throw new ForbiddenException('作成者のみ編集できます');
    return this.prisma.todoList.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.color !== undefined && { color: dto.color }),
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async remove(id: string, currentUser: User) {
    const list = await this.prisma.todoList.findUnique({ where: { id } });
    if (!list) throw new NotFoundException('リストが見つかりません');
    if (list.createdBy !== currentUser.id) throw new ForbiddenException('作成者のみ削除できます');
    await this.prisma.todoList.delete({ where: { id } });
  }
}
