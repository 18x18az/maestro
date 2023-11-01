import { Module } from '@nestjs/common'
import { FieldControlController } from './field-control.controller'
import { FieldControlInternal } from './field-control.internal'
import { FieldModule } from '../field/field.module'
import { FieldControlPublisher } from './field-control.publisher'
import { PublishModule } from '@/utils'
import { MatchModule } from '../match'
import { StageModule } from '../stage'

@Module({
  imports: [FieldModule, PublishModule, MatchModule, StageModule],
  controllers: [FieldControlController],
  providers: [FieldControlInternal, FieldControlPublisher]
})
export class FieldControlModule {}
