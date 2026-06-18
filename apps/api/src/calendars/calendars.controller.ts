import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CalendarsService } from './calendars.service';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';

@ApiTags('Calendars')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('calendars')
export class CalendarsController {
  constructor(private readonly calendarsService: CalendarsService) {}

  @Get()
  @ApiOperation({ summary: 'List all calendars in my group' })
  findAll(@CurrentUser() user: User, @Query('groupId') groupId?: string) {
    return this.calendarsService.findAll(user, groupId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a calendar' })
  create(@Body() dto: CreateCalendarDto, @CurrentUser() user: User) {
    return this.calendarsService.create(dto, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a calendar' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCalendarDto,
    @CurrentUser() user: User,
  ) {
    return this.calendarsService.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a calendar' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.calendarsService.remove(id, user);
  }
}
