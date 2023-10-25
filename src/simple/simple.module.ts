import { Module } from '@nestjs/common'
import { SimpleService } from './simple.service'
import { SimplePublisher } from './simple.publisher'
import { StorageModule } from '@/utils/storage/storage.module'
import { PublishService } from '@/utils/publish/publish.service'
import { SimpleController } from './simple.controller'
import { HttpModule } from '@nestjs/axios'
import { SimpleRepo } from './simple.repo'
import { MatchLifecycleService } from './match-lifecycle.service'
import { TimerService } from './timer.service'
import { FieldControlService } from './field-control.service'
import { MatchService } from './match.service'
import { TmService } from './tm-service'
import { StageService } from './stage.service'

@Module({
  controllers: [SimpleController],
  imports: [StorageModule, HttpModule],
  providers: [SimpleService, SimplePublisher, PublishService, SimpleRepo, MatchLifecycleService, TimerService, FieldControlService, MatchService, TmService, StageService]
})
export class SimpleModule {}
