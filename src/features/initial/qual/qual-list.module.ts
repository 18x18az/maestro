import { Module } from '@nestjs/common'
import { QualListController } from './qual-list.controller'
import { QualScheduleService } from './qual-list.service'
import { StorageModule } from '../../../utils/storage/storage.module'
import { PublishModule } from '../../../utils/publish/publish.module'
import { PrismaService } from 'utils/prisma/prisma.service'
import { PersistentRepo } from './persistent.repo'
import { QualSchedulePublisher } from './qual-list.publisher'
import { WorkingRepo } from './working.repo'
import { QualListRepo } from './qual-list.repo'

@Module({
  imports: [StorageModule, PublishModule],
  controllers: [QualListController],
  providers: [QualScheduleService, QualScheduleService, PrismaService, PersistentRepo, WorkingRepo, QualSchedulePublisher, QualListRepo]
})
export class QualListModule {}
