import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColorLabelDto } from './dto/create-color-label.dto';
import { UpdateColorLabelDto } from './dto/update-color-label.dto';

@Injectable()
export class ColorLabelsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(currentUser: User) {
    return this.prisma.colorLabel.findMany({
      where: { userId: currentUser.id },
      orderBy: { sortOrder: 'asc' },
    });
  }

  create(dto: CreateColorLabelDto, currentUser: User) {
    return this.prisma.colorLabel.create({
      data: {
        userId: currentUser.id,
        name: dto.name,
        color: dto.color,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async findOne(id: string, currentUser: User) {
    const label = await this.prisma.colorLabel.findUnique({ where: { id } });
    if (!label) throw new NotFoundException('カラーラベルが見つかりません');
    if (label.userId !== currentUser.id) throw new ForbiddenException('自分のカラーラベルのみ参照できます');
    return label;
  }

  async update(id: string, dto: UpdateColorLabelDto, currentUser: User) {
    const label = await this.prisma.colorLabel.findUnique({ where: { id } });
    if (!label) throw new NotFoundException('カラーラベルが見つかりません');
    if (label.userId !== currentUser.id) throw new ForbiddenException('自分のカラーラベルのみ更新できます');
    return this.prisma.colorLabel.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  async remove(id: string, currentUser: User) {
    const label = await this.prisma.colorLabel.findUnique({ where: { id } });
    if (!label) throw new NotFoundException('カラーラベルが見つかりません');
    if (label.userId !== currentUser.id) throw new ForbiddenException('自分のカラーラベルのみ削除できます');
    await this.prisma.colorLabel.delete({ where: { id } });
  }
}
