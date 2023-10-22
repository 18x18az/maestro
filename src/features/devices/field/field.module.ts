import { Module } from '@nestjs/common'
import { FieldsController } from './fields.controller'
import { FieldService } from './fields.service'
import { FieldsPublisher } from './fields.publisher'
import { PublishService } from 'utils/publish/publish.service'
import { PublicFieldService } from './public.service'
import { FieldRepo } from './field.repo'
import { PrismaService } from '@/utils/prisma/prisma.service'

@Module({
  controllers: [FieldsController],
  providers: [PublicFieldService, FieldService, FieldsPublisher, PublishService, FieldRepo, PrismaService],
  exports: [PublicFieldService]
})
export class FieldModule {}
