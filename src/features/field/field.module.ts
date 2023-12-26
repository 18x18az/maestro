import { Module } from '@nestjs/common'
import { FieldService } from './field.service'
import { FieldRepo } from './field.repo'
import { PrismaModule, PublishModule } from '@/utils'
import { FieldPublisher } from './field.publisher'
import { FieldController } from './field.controller'
import { FieldEntity } from './field.entity'
import { FieldResolver } from './field.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [PrismaModule, PublishModule, TypeOrmModule.forFeature([FieldEntity])],
  controllers: [FieldController],
  providers: [FieldResolver, FieldService, FieldRepo, FieldPublisher],
  exports: [FieldService]
})
export class FieldModule {}
