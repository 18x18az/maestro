import { Module } from '@nestjs/common'
import { QualListController } from './qual-list.controller'
import { QualScheduleService } from './qual-list.service'
import { StorageModule } from '../../../utils/storage/storage.module'
import { PublishModule } from '../../../utils/publish/publish.module'
import { PrismaService } from 'utils/prisma/prisma.service'
import { QualScheduleRepo } from './qual-list.repo'
import { QualSchedulePublisher } from './qual-list.publisher'

@Module({
  imports: [StorageModule, PublishModule],
  controllers: [QualListController],
  providers: [QualScheduleService, QualScheduleService, PrismaService, QualScheduleRepo, QualSchedulePublisher]
})
export class QualListModule {}
