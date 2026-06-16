import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

export class CreateCalendarDto {
  @ApiProperty({ example: 'Work' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: '#FF6B6B', description: '#RRGGBB hex color' })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color must be in #RRGGBB format' })
  color!: string;
}
