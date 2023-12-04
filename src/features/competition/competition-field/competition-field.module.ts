import { Module } from '@nestjs/common'
import { CompetitionFieldService } from './competition-field.service'
import { CompetitionFieldControlService } from './competition-field-control.service'
import { CompetitionFieldRepo } from './competition-field.repo'
import { MatchModule } from '../match'
import { CompetitionFieldPublisher } from './competition-field.publisher'
import { LifecycleService } from './lifecyle.service'
import { VacancyService } from './vacancy.service'
import { CompetitionFieldController } from './competition-field.controller'
import { FieldControlModule, FieldModule } from '../../field'
import { PrismaModule, PublishModule } from '@/utils'

@Module({
  controllers: [CompetitionFieldController],
  imports: [PrismaModule, MatchModule, FieldControlModule, PublishModule, FieldModule],
  providers: [CompetitionFieldService, CompetitionFieldControlService, CompetitionFieldRepo, CompetitionFieldPublisher, LifecycleService, VacancyService],
  exports: [CompetitionFieldService]
})
export class CompetitionFieldModule {}
