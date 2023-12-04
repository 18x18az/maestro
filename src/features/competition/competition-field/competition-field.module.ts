import { Module } from '@nestjs/common'
import { CompetitionFieldService } from './competition-field.service'
import { FieldModule } from '../field'
import { CompetitionFieldControlService } from './competition-field-control.service'
import { PrismaModule, PublishModule } from '../../utils'
import { CompetitionFieldRepo } from './competition-field.repo'
import { MatchModule } from '../match'
import { CompetitionFieldPublisher } from './competition-field.publisher'
import { FieldControlModule } from '../field-control'
import { LifecycleService } from './lifecyle.service'
import { VacancyService } from './vacancy.service'
import { CompetitionFieldController } from './competition-field.controller'

@Module({
  controllers: [CompetitionFieldController],
  imports: [FieldModule, PrismaModule, MatchModule, FieldControlModule, PublishModule],
  providers: [CompetitionFieldService, CompetitionFieldControlService, CompetitionFieldRepo, CompetitionFieldPublisher, LifecycleService, VacancyService],
  exports: [CompetitionFieldService]
})
export class CompetitionFieldModule {}
