import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsUUID } from 'class-validator';

export class AssignShiftDto {
  @ApiProperty({ description: 'ShiftPattern IDs to assign', type: [String] })
  @IsArray()
  @IsUUID('all', { each: true })
  shiftPatternIds!: string[];

  @ApiPropertyOptional({ description: 'Target group ID (defaults to user\'s first group)' })
  @IsOptional()
  @IsUUID()
  groupId?: string;
}
