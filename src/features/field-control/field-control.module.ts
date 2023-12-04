import { Module } from '@nestjs/common'
import { FieldControlService } from './field-control.service'
import { FieldControlPublisher } from './field-control.publisher'
import { FieldModule } from '../field/field.module'
import { PublishModule } from '../../utils'

@Module({
  imports: [FieldModule, PublishModule],
  providers: [FieldControlService, FieldControlPublisher],
  exports: [FieldControlService]
})

export class FieldControlModule {}
