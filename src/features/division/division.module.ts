import { Module } from '@nestjs/common';
import { DivisionService } from './division.service';
import { DivisionController } from './division.controller';

@Module({
  providers: [DivisionService],
  controllers: [DivisionController]
})
export class DivisionModule {}
