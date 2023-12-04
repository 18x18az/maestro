import { Module } from '@nestjs/common'
import { FieldControlService } from './field-control.service'
import { FieldControlPublisher } from './field-control.publisher'
import { PublishModule } from '@/utils'
import { FieldModule } from '../field'

@Module({
  imports: [FieldModule, PublishModule],
  providers: [FieldControlService, FieldControlPublisher],
  exports: [FieldControlService]
})

export class FieldControlModule {}
