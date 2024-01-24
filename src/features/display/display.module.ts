import { Module } from '@nestjs/common'
import { DisplayService } from './display.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DisplayEntity } from './display.entity'
import { DisplayResolver } from './display.resolver'
import { DisplayRepo } from './display.repo'
import { FieldModule } from '../field/field.module'

@Module({
  imports: [TypeOrmModule.forFeature([DisplayEntity]), FieldModule],
  providers: [DisplayService, DisplayResolver, DisplayRepo]
})
export class DisplayModule {}
