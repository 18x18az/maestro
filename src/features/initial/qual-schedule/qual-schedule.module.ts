import { Module } from '@nestjs/common';
import { QualScheduleController } from './qual-schedule.controller';
import { QualScheduleService } from './qual-schedule.service';
import { StorageModule } from 'src/utils/storage/storage.module';
import { PublishModule } from 'src/utils/publish/publish.module';

@Module({
  imports: [StorageModule, PublishModule],
  controllers: [QualScheduleController],
  providers: [QualScheduleService]
})
export class QualScheduleModule {}
