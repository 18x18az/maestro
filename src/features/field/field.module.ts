import { Module } from '@nestjs/common'
import { FieldService } from './field.service'
import { FieldRepo } from './field.repo'
import { PrismaModule } from '@/utils'

@Module({
  imports: [PrismaModule],
  providers: [FieldService, FieldRepo],
  exports: [FieldService]
})
export class FieldModule {}
