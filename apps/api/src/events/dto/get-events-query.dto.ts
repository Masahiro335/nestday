import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, Matches } from 'class-validator';

export class GetEventsQueryDto {
  @ApiProperty({ example: '2026-06', description: 'YYYY-MM format' })
  @Matches(/^\d{4}-\d{2}$/, { message: 'month must be in YYYY-MM format' })
  month!: string;

  @ApiPropertyOptional({ description: 'Filter by specific group ID' })
  @IsOptional()
  @IsUUID()
  groupId?: string;
}
