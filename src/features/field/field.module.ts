import { Module, forwardRef } from '@nestjs/common'
import { FieldService } from './field.service'
import { FieldEntity } from './field.entity'
import { FieldResolver } from './field.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EnableFieldEvent } from './enable-field.event'
import { FieldRepo } from './field.repo'
import { DisableFieldEvent } from './disable-field.event'
import { FieldControlModule } from '../field-control/field-control.module'
import { CompetitionFieldModule } from '../competition/competition-field/competition-field.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([FieldEntity]),
    forwardRef(() => FieldControlModule),
    forwardRef(() => CompetitionFieldModule)
  ],
  providers: [FieldResolver, FieldService, EnableFieldEvent, DisableFieldEvent, FieldRepo],
  exports: [FieldService, EnableFieldEvent, DisableFieldEvent]
})
export class FieldModule {}
