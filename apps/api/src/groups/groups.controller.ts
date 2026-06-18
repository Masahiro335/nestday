import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupsService } from './groups.service';

@ApiTags('Groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new group' })
  create(@Body() dto: CreateGroupDto, @CurrentUser() user: User) {
    return this.groupsService.create(dto, user);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my first group with members' })
  getMyGroup(@CurrentUser() user: User) {
    return this.groupsService.getMyGroup(user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all groups the current user belongs to' })
  getMyGroups(@CurrentUser() user: User) {
    return this.groupsService.getMyGroups(user);
  }

  @Get('join/:token')
  @ApiOperation({ summary: 'Preview group info by invite token' })
  getGroupPreview(@Param('token') token: string) {
    return this.groupsService.getGroupPreview(token);
  }

  @Post('join/:token')
  @ApiOperation({ summary: 'Join a group by invite token' })
  joinGroup(@Param('token') token: string, @CurrentUser() user: User) {
    return this.groupsService.joinGroup(token, user);
  }

  @Delete(':groupId/members/:userId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove a member from a group (owner only)' })
  removeMember(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: User,
  ) {
    return this.groupsService.removeMember(groupId, userId, user);
  }
}
