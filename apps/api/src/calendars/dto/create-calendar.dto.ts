import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Matches, MinLength } from 'class-validator';

export class CreateCalendarDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  groupId?: string;

  @ApiProperty({ example: 'Work' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: '#FF6B6B', description: '#RRGGBB hex color' })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color must be in #RRGGBB format' })
  color!: string;
}
