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
import { ColorLabelsService } from './color-labels.service';
import { CreateColorLabelDto } from './dto/create-color-label.dto';
import { UpdateColorLabelDto } from './dto/update-color-label.dto';

@ApiTags('ColorLabels')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('color-labels')
export class ColorLabelsController {
  constructor(private readonly colorLabelsService: ColorLabelsService) {}

  @Get()
  @ApiOperation({ summary: 'List my color labels' })
  findAll(@CurrentUser() user: User) {
    return this.colorLabelsService.findAll(user);
  }

  @Post()
  @ApiOperation({ summary: 'Create a color label' })
  create(@Body() dto: CreateColorLabelDto, @CurrentUser() user: User) {
    return this.colorLabelsService.create(dto, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a color label (owner only)' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.colorLabelsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a color label (owner only)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateColorLabelDto,
    @CurrentUser() user: User,
  ) {
    return this.colorLabelsService.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a color label (owner only)' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.colorLabelsService.remove(id, user);
  }
}
