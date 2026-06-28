import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class AssignShiftDto {
  @ApiProperty({ description: 'ShiftPattern IDs to assign', type: [String] })
  @IsArray()
  @IsUUID('all', { each: true })
  shiftPatternIds!: string[];
}
