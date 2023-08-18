import { Module } from '@nestjs/common'
import { InspectionService } from './inspection.service'
import { InspectionController } from './inspection.controller'
import { InspectionDatabase } from './repo.service'
import { InMemoryDBService } from '@nestjs-addons/in-memory-db'
import { PrismaService } from '../../../utils/prisma/prisma.service'
import { PublishService } from '../../../utils/publish/publish.service'
import { TeamModel } from './models/team.model'
import { OverallModel } from './models/overall.model'
import { InspectionPublisher } from './inspection.publisher'

@Module({
  providers: [InspectionService, PrismaService, InspectionDatabase, InMemoryDBService, PublishService, TeamModel, OverallModel, InspectionPublisher],
  controllers: [InspectionController]
})
export class InspectionModule {}
