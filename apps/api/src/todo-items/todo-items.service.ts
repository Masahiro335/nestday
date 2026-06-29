import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoItemDto } from './dto/create-todo-item.dto';
import { UpdateTodoItemDto } from './dto/update-todo-item.dto';

const itemInclude = {
  include: {
    creator: { select: { id: true, name: true, email: true } },
    assignee: { select: { id: true, name: true, email: true } },
  },
} as const;

@Injectable()
export class TodoItemsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getGroupId(userId: string): Promise<string> {
    const membership = await this.prisma.groupMember.findFirst({
      where: { userId },
    });
    if (!membership) throw new NotFoundException('グループが見つかりません');
    return membership.groupId;
  }

  async findByList(listId: string, currentUser: User) {
    const groupId = await this.getGroupId(currentUser.id);
    const list = await this.prisma.todoList.findUnique({ where: { id: listId } });
    if (!list || list.groupId !== groupId) throw new NotFoundException('リストが見つかりません');

    return this.prisma.todoItem.findMany({
      where: { listId },
      ...itemInclude,
      orderBy: [{ isCompleted: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async create(dto: CreateTodoItemDto, currentUser: User) {
    const groupId = await this.getGroupId(currentUser.id);
    const list = await this.prisma.todoList.findUnique({ where: { id: dto.listId } });
    if (!list || list.groupId !== groupId) throw new NotFoundException('リストが見つかりません');

    return this.prisma.todoItem.create({
      data: {
        listId: dto.listId,
        groupId,
        createdBy: currentUser.id,
        title: dto.title,
        memo: dto.memo,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        assignedTo: dto.assignedTo ?? null,
      },
      ...itemInclude,
    });
  }

  async update(id: string, dto: UpdateTodoItemDto, currentUser: User) {
    const item = await this.prisma.todoItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('TODOが見つかりません');
    if (item.createdBy !== currentUser.id) throw new ForbiddenException('作成者のみ編集できます');

    const completedAt =
      dto.isCompleted === true && !item.isCompleted
        ? new Date()
        : dto.isCompleted === false
          ? null
          : undefined;

    return this.prisma.todoItem.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.memo !== undefined && { memo: dto.memo }),
        ...(dto.dueDate !== undefined && { dueDate: dto.dueDate ? new Date(dto.dueDate) : null }),
        ...('assignedTo' in dto && { assignedTo: dto.assignedTo ?? null }),
        ...(dto.isCompleted !== undefined && { isCompleted: dto.isCompleted }),
        ...(completedAt !== undefined && { completedAt }),
      },
      ...itemInclude,
    });
  }

  async remove(id: string, currentUser: User) {
    const item = await this.prisma.todoItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('TODOが見つかりません');
    if (item.createdBy !== currentUser.id) throw new ForbiddenException('作成者のみ削除できます');
    await this.prisma.todoItem.delete({ where: { id } });
  }
}
