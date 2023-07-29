import { Module } from '@nestjs/common'
import { InspectionService } from './inspection.service'
import { InspectionController } from './inspection.controller'
import { PrismaService } from 'src/utils/prisma/prisma.service'
import { InspectionDatabase } from './repo.service'
import { InMemoryDBService } from '@nestjs-addons/in-memory-db'
import { PublishService } from 'src/utils/publish/publish.service'

@Module({
  providers: [InspectionService, PrismaService, InspectionDatabase, InMemoryDBService, PublishService],
  controllers: [InspectionController]
})
export class InspectionModule {}
