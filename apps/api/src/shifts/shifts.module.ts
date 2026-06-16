import { Module } from '@nestjs/common';
import { ShiftPatternsController } from './shift-patterns.controller';
import { ShiftPatternsService } from './shift-patterns.service';
import { ShiftsController } from './shifts.controller';
import { ShiftsService } from './shifts.service';

@Module({
  controllers: [ShiftPatternsController, ShiftsController],
  providers: [ShiftPatternsService, ShiftsService],
})
export class ShiftsModule {}
