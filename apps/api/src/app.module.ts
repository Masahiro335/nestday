import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { GroupsModule } from './groups/groups.module';
import { CalendarsModule } from './calendars/calendars.module';
import { EventsModule } from './events/events.module';
import { ColorLabelsModule } from './color-labels/color-labels.module';
import { ShiftsModule } from './shifts/shifts.module';
import { UsersModule } from './users/users.module';
import { TodoListsModule } from './todo-lists/todo-lists.module';
import { TodoItemsModule } from './todo-items/todo-items.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    SupabaseModule,
    AuthModule,
    GroupsModule,
    CalendarsModule,
    EventsModule,
    ColorLabelsModule,
    ShiftsModule,
    UsersModule,
    TodoListsModule,
    TodoItemsModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
