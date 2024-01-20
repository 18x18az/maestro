import { Module, forwardRef } from '@nestjs/common'
import { FieldControlService } from './field-control.service'
import { LoadFieldEvent } from './load-field.event'
import { FieldModule } from '../field/field.module'
import { FieldControlResolver } from './field-control.resolver'
import { StartFieldEvent } from './start-field.event'
import { StopFieldEvent } from './stop-field.event'

@Module({
  imports: [forwardRef(() => FieldModule)],
  providers: [FieldControlService, LoadFieldEvent, FieldControlResolver, StartFieldEvent, StopFieldEvent],
  exports: [FieldControlService, LoadFieldEvent, StartFieldEvent, StopFieldEvent]
})

export class FieldControlModule {}
