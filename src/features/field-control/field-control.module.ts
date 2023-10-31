import { Module } from '@nestjs/common'
import { FieldControlController } from './field-control.controller'
import { FieldControlInternal } from './field-control.internal'
import { FieldModule } from '../field/field.module'
import { FieldControlPublisher } from './field-control.publisher'
import { PublishModule } from '@/utils'

@Module({
  imports: [FieldModule, PublishModule],
  controllers: [FieldControlController],
  providers: [FieldControlInternal, FieldControlPublisher]
})
export class FieldControlModule {}
