import { Module } from '@nestjs/common';
import { ColorLabelsController } from './color-labels.controller';
import { ColorLabelsService } from './color-labels.service';

@Module({
  controllers: [ColorLabelsController],
  providers: [ColorLabelsService],
})
export class ColorLabelsModule {}
