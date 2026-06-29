import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TodoListsController } from './todo-lists.controller';
import { TodoListsService } from './todo-lists.service';

@Module({
  imports: [PrismaModule],
  controllers: [TodoListsController],
  providers: [TodoListsService],
})
export class TodoListsModule {}
