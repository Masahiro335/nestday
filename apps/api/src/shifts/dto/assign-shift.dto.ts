import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignShiftDto {
  @ApiProperty({ description: 'ShiftPattern ID to assign' })
  @IsUUID()
  shiftPatternId!: string;
}
