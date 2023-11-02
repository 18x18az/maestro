import { Module } from '@nestjs/common'
import { FieldControlController } from './field-control.controller'
import { FieldControlInternal } from './field-control.internal'
import { FieldModule } from '../field/field.module'
import { FieldControlPublisher } from './field-control.publisher'
import { PublishModule } from '@/utils'
import { MatchModule } from '../match'
import { StageModule } from '../stage'
import { FieldControlService } from './field-control.service'
import { StreamModule } from '../stream'

@Module({
  imports: [FieldModule, PublishModule, MatchModule, StageModule, StreamModule],
  controllers: [FieldControlController],
  providers: [FieldControlInternal, FieldControlPublisher, FieldControlService],
  exports: [FieldControlService]
})
export class FieldControlModule {}
