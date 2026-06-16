import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateShiftPatternDto } from './dto/create-shift-pattern.dto';
import { UpdateShiftPatternDto } from './dto/update-shift-pattern.dto';
import { ShiftPatternsService } from './shift-patterns.service';

@ApiTags('ShiftPatterns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('shift-patterns')
export class ShiftPatternsController {
  constructor(private readonly shiftPatternsService: ShiftPatternsService) {}

  @Get()
  @ApiOperation({ summary: 'List my shift patterns (sort_order asc)' })
  findAll(@CurrentUser() user: User) {
    return this.shiftPatternsService.findAll(user);
  }

  @Post()
  @ApiOperation({ summary: 'Create a shift pattern' })
  create(@Body() dto: CreateShiftPatternDto, @CurrentUser() user: User) {
    return this.shiftPatternsService.create(dto, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a shift pattern (owner only)' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.shiftPatternsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a shift pattern (owner only)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateShiftPatternDto,
    @CurrentUser() user: User,
  ) {
    return this.shiftPatternsService.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a shift pattern (owner only)' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.shiftPatternsService.remove(id, user);
  }
}
