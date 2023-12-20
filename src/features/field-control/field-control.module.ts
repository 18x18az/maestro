import { Module } from '@nestjs/common'
import { FieldControlService } from './field-control.service'
import { FieldControlPublisher } from './field-control.publisher'
import { PublishModule } from '@/utils'
import { FieldModule } from '../field'
import { StartFieldEvent } from './start-field.event'
import { StopFieldEvent } from './stop-field.event'
import { LoadFieldEvent } from './load-field.event'

@Module({
  imports: [FieldModule, PublishModule],
  providers: [FieldControlService, FieldControlPublisher, StartFieldEvent, LoadFieldEvent, StopFieldEvent],
  exports: [FieldControlService, LoadFieldEvent, StartFieldEvent, StopFieldEvent]
})

export class FieldControlModule {}
