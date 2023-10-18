import { Module } from '@nestjs/common'
import { FieldSetService } from './fieldSet.service'
import { PublishService } from 'utils/publish/publish.service'
import { FieldSetPublisher } from './fieldSet.publisher'

@Module({
  providers: [FieldSetService, PublishService, FieldSetPublisher]
})
export class FieldSetModule {}
