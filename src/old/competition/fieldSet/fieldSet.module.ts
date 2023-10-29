import { Module } from '@nestjs/common'
import { FieldSetService } from './fieldSet.service'
import { PublishService } from '@/old_utils/publish/publish.service'
import { FieldSetPublisher } from './fieldSet.publisher'
import { FieldSetController } from './field-set.controller'

@Module({
  controllers: [FieldSetController],
  providers: [FieldSetService, PublishService, FieldSetPublisher]
})
export class FieldSetModule {}
