import { Module } from '@nestjs/common'
import { QualScheduleController } from './qual-schedule.controller'
import { QualScheduleService } from './qual-schedule.service'
import { StorageModule } from '../../../utils/storage/storage.module'
import { PublishModule } from '../../../utils/publish/publish.module'

@Module({
  imports: [StorageModule, PublishModule],
  controllers: [QualScheduleController],
  providers: [QualScheduleService]
})
export class QualScheduleModule {}
