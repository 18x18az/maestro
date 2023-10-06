import { Module } from '@nestjs/common'
import { DivisionService } from './division.service'
import { DivisionController } from './division.controller'
import { PrismaService } from '../../utils/prisma/prisma.service'
import { DivisionRepo } from './division.repo'

@Module({
  providers: [DivisionService, DivisionRepo, PrismaService],
  controllers: [DivisionController]
})
export class DivisionModule {}
