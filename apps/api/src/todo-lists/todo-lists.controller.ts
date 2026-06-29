import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateTodoListDto } from './dto/create-todo-list.dto';
import { UpdateTodoListDto } from './dto/update-todo-list.dto';
import { TodoListsService } from './todo-lists.service';

@ApiTags('TodoLists')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('todo-lists')
export class TodoListsController {
  constructor(private readonly todoListsService: TodoListsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all todo lists for a group' })
  @ApiQuery({ name: 'groupId', required: false })
  findAll(@Query('groupId') groupId: string | undefined, @CurrentUser() user: User) {
    return this.todoListsService.findAll(user, groupId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a todo list' })
  create(@Body() dto: CreateTodoListDto, @CurrentUser() user: User) {
    return this.todoListsService.create(dto, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a todo list (creator only)' })
  update(@Param('id') id: string, @Body() dto: UpdateTodoListDto, @CurrentUser() user: User) {
    return this.todoListsService.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a todo list (creator only)' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.todoListsService.remove(id, user);
  }
}
