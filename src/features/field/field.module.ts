import { Module } from '@nestjs/common'
import { FieldService } from './field.service'

@Module({
  exports: [FieldService]
})
export class FieldModule {}
