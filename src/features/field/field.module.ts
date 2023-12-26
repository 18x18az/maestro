import { Module } from '@nestjs/common'
import { FieldService } from './field.service'
import { FieldEntity } from './field.entity'
import { FieldResolver } from './field.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [TypeOrmModule.forFeature([FieldEntity])],
  providers: [FieldResolver, FieldService],
  exports: [FieldService]
})
export class FieldModule {}
