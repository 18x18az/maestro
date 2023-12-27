import { Module, forwardRef } from '@nestjs/common'
import { FieldControlService } from './field-control.service'
import { LoadFieldEvent } from './load-field.event'
import { FieldModule } from '../field/field.module'
import { FieldControlResolver } from './field-control.resolver'

@Module({
  imports: [forwardRef(() => FieldModule)],
  providers: [FieldControlService, LoadFieldEvent, FieldControlResolver],
  exports: [FieldControlService, LoadFieldEvent]
})

export class FieldControlModule {}
