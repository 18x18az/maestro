import { Module } from '@nestjs/common'
import { FieldService } from './field.service'
import { FieldRepo } from './field.repo'
import { PrismaModule, PublishModule } from '@/utils'
import { FieldPublisher } from './field.publisher'
import { FieldController } from './field.controller'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Field } from './field.entity'
import { FieldResolver } from './field.resolver'

@Module({
  imports: [PrismaModule, PublishModule, MikroOrmModule.forFeature([Field])],
  controllers: [FieldController],
  providers: [FieldResolver, FieldService, FieldRepo, FieldPublisher],
  exports: [FieldService]
})
export class FieldModule {}
