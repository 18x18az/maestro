import { Module } from '@nestjs/common'
import { CompetitionFieldService } from './competition-field.service'
import { CompetitionFieldControlService } from './competition-field-control.service'
import { CompetitionFieldRepo } from './competition-field.repo'
import { MatchModule } from '../match'
import { CompetitionFieldPublisher } from './competition-field.publisher'
import { LifecycleService } from './lifecyle.service'
import { VacancyService } from './vacancy.service'
import { CompetitionFieldController } from './competition-field.controller'
import { PrismaModule, PublishModule } from '@/utils'
import { FieldModule } from '../../field/field.module'
import { FieldControlModule } from '@/features/field-control'

@Module({
  imports: [PrismaModule, MatchModule, FieldControlModule, PublishModule, FieldModule],
  controllers: [CompetitionFieldController],
  providers: [CompetitionFieldService, CompetitionFieldControlService, CompetitionFieldRepo, CompetitionFieldPublisher, LifecycleService, VacancyService],
  exports: [CompetitionFieldService]
})
export class CompetitionFieldModule {}
