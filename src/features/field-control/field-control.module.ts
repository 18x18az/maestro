import { Module } from '@nestjs/common'
import { FieldControlController } from './field-control.controller'
import { FieldControlInternal } from './field-control.internal'
import { FieldModule } from '../field/field.module'
import { FieldControlPublisher } from './field-control.publisher'
import { PublishModule, StorageModule } from '@/utils'
import { MatchModule } from '../match'
import { StageModule } from '../stage'
import { FieldControlService } from './field-control.service'
import { StreamModule } from '../stream'
import { TimeoutService } from './timeout.service'
import { FieldControlRepo } from './field-control.repo'
import { MatchManager } from './match-manager.service'
import { ActiveService } from './active-control.service'
import { FieldStatusService } from './field-status.service'

@Module({
  imports: [FieldModule, PublishModule, MatchModule, StageModule, StreamModule, StorageModule],
  controllers: [FieldControlController],
  providers: [FieldControlInternal, FieldControlPublisher, FieldControlService, TimeoutService, FieldControlRepo, MatchManager, ActiveService, FieldStatusService],
  exports: [FieldControlService]
})
export class FieldControlModule {}
