import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateTodoItemDto } from './dto/create-todo-item.dto';
import { UpdateTodoItemDto } from './dto/update-todo-item.dto';
import { TodoItemsService } from './todo-items.service';

@ApiTags('TodoItems')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('todo-items')
export class TodoItemsController {
  constructor(private readonly todoItemsService: TodoItemsService) {}

  @Get()
  @ApiOperation({ summary: 'Get todo items by list ID' })
  @ApiQuery({ name: 'listId', required: true })
  findByList(@Query('listId') listId: string, @CurrentUser() user: User) {
    return this.todoItemsService.findByList(listId, user);
  }

  @Post()
  @ApiOperation({ summary: 'Create a todo item' })
  create(@Body() dto: CreateTodoItemDto, @CurrentUser() user: User) {
    return this.todoItemsService.create(dto, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a todo item (creator only)' })
  update(@Param('id') id: string, @Body() dto: UpdateTodoItemDto, @CurrentUser() user: User) {
    return this.todoItemsService.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a todo item (creator only)' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.todoItemsService.remove(id, user);
  }
}
