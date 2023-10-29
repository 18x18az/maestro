import { Module } from '@nestjs/common'
import { SimpleService } from './simple.service'
import { SimplePublisher } from './simple.publisher'
import { StorageModule } from '@/old_utils/storage/storage.module'
import { PublishService } from '@/old_utils/publish/publish.service'
import { SimpleController } from './simple.controller'
import { HttpModule } from '@nestjs/axios'
import { SimpleRepo } from './simple.repo'
import { MatchLifecycleService } from './match-lifecycle.service'
import { TimerService } from './timer.service'
import { FieldControlService } from './field-control.service'
import { MatchService } from './match.service'
import { TmService } from './tm-service'
import { StageService } from './stage.service'
import { ObsService } from './obs.service'
import { ResultsService } from './results.service'
import { TimeoutService } from './timeout.service'

@Module({
  controllers: [SimpleController],
  imports: [StorageModule, HttpModule],
  providers: [SimpleService, SimplePublisher, PublishService, SimpleRepo, MatchLifecycleService, TimerService, FieldControlService, MatchService, TmService, StageService, ObsService, ResultsService, TimeoutService]
})
export class SimpleModule {}
