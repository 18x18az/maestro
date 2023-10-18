import { Module } from '@nestjs/common'
import { FieldsController } from './fields.controller'
import { FieldsService } from './fields.service'
import { FieldsPublisher } from './fields.publisher'
import { PublishService } from 'utils/publish/publish.service'

@Module({
  controllers: [FieldsController],
  providers: [FieldsService, FieldsPublisher, PublishService]
})
export class FieldsModule {}
