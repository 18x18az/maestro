import { Module } from '@nestjs/common'
import { FieldControlController } from './field-control.controller'
import { FieldControlInternal } from './field-control.internal'
import { FieldModule } from '../field/field.module'
import { FieldControlPublisher } from './field-control.publisher'
import { PublishModule, StorageModule } from '@/utils'
import { MatchModule } from '../match'
import { StageModule } from '../stage'
import { FieldControlService } from './field-control.service'
import { TimeoutService } from './timeout.service'
import { FieldControlRepo } from './field-control.repo'
import { MatchManager } from './match-manager.service'
import { ActiveService } from './active-control.service'
import { FieldStatusService } from './field-status.service'
import { ResultManager } from './result-manager.service'
import { SkillsService } from './skills.service'

@Module({
  imports: [FieldModule, PublishModule, MatchModule, StageModule, StorageModule],
  controllers: [FieldControlController],
  providers: [ResultManager, FieldControlInternal, FieldControlPublisher, FieldControlService, TimeoutService, FieldControlRepo, MatchManager, ActiveService, FieldStatusService, SkillsService],
  exports: [FieldControlService]
})
export class FieldControlModule {}
