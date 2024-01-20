import { Module, forwardRef } from '@nestjs/common'
import { FieldControlService } from './field-control.service'
import { LoadFieldEvent } from './load-field.event'
import { FieldModule } from '../field/field.module'
import { FieldControlResolver } from './field-control.resolver'
import { StartFieldEvent } from './start-field.event'

@Module({
  imports: [forwardRef(() => FieldModule)],
  providers: [FieldControlService, LoadFieldEvent, FieldControlResolver, StartFieldEvent],
  exports: [FieldControlService, LoadFieldEvent, StartFieldEvent]
})

export class FieldControlModule {}
