import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Matches, Min, MinLength } from 'class-validator';

export class CreateColorLabelDto {
  @ApiProperty({ example: '仕事' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: '#FF6B6B', description: '#RRGGBB hex color' })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color は #RRGGBB 形式で指定してください' })
  color!: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
