import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Matches, MinLength } from 'class-validator';

export class CreateTodoListDto {
  @ApiProperty({ example: '買うものリスト' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiPropertyOptional({ example: '#3b82f6' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color must be in #RRGGBB format' })
  color?: string;

  @ApiPropertyOptional({ description: 'Target group ID (defaults to user\'s first group)' })
  @IsOptional()
  @IsUUID()
  groupId?: string;
}
