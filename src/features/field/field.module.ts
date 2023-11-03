import { Module } from '@nestjs/common'
import { FieldService } from './field.service'
import { FieldRepo } from './field.repo'
import { PrismaModule, PublishModule } from '@/utils'
import { FieldPublisher } from './field.publisher'

@Module({
  imports: [PrismaModule, PublishModule],
  providers: [FieldService, FieldRepo, FieldPublisher],
  exports: [FieldService]
})
export class FieldModule {}
