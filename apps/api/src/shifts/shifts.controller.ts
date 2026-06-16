import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetEventsQueryDto } from '../events/dto/get-events-query.dto';
import { AssignShiftDto } from './dto/assign-shift.dto';
import { ShiftsService } from './shifts.service';

@ApiTags('Shifts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Get()
  @ApiOperation({ summary: 'List all group shifts by month (with shift_pattern)' })
  findAll(@Query() query: GetEventsQueryDto, @CurrentUser() user: User) {
    return this.shiftsService.findAll(query, user);
  }

  @Put(':date')
  @ApiOperation({ summary: 'Assign (upsert) my shift for a date (YYYY-MM-DD)' })
  assign(
    @Param('date') date: string,
    @Body() dto: AssignShiftDto,
    @CurrentUser() user: User,
  ) {
    return this.shiftsService.assign(date, dto, user);
  }

  @Delete(':date')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete my shift for a date (YYYY-MM-DD)' })
  remove(@Param('date') date: string, @CurrentUser() user: User) {
    return this.shiftsService.remove(date, user);
  }
}
