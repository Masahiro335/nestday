import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Matches, Min, MinLength } from 'class-validator';

export class CreateShiftPatternDto {
  @ApiProperty({ example: '早番' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: '#FF6B6B', description: '#RRGGBB hex color' })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color must be in #RRGGBB format' })
  color!: string;

  @ApiPropertyOptional({ example: '09:00' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ example: '18:00' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsInt()
  @Min(0)
  breakMinutes?: number;

  // isDayOff: true のとき startTime / endTime は null でも可
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDayOff?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
