import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ example: 'My Team' })
  @IsString()
  @MinLength(1)
  name!: string;
}
