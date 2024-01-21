import { Module, forwardRef } from '@nestjs/common'
import { CompetitionFieldService } from './competition-field.service'
import { CompetitionFieldControlService } from './competition-field-control.service'
import { CompetitionFieldRepo } from './competition-field.repo'
import { FieldModule } from '../../field/field.module'
import { FieldControlModule } from '../../field-control/field-control.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CompetitionFieldEntity } from './competition-field.entity'
import { EnableCompetitionFieldEvent } from './enable-competition-field.event'
import { CompetitionFieldResolver } from './competition-field.resolver'
import { QueueSittingEvent } from './queue-sitting.event'
import { RemoveOnFieldSittingEvent } from './remove-on-field-sitting.event'
import { UnqueueSittingEvent } from './unqueue-sitting.event'
import { RemoveOnTableSittingEvent } from './remove-on-table-sitting.event'
import { PeriodEndEvent } from './period-end.event'
import { PeriodStartEvent } from './period-start.event'
import { AutonStartEvent } from './auton-start.event'
import { CompetitionFieldControlCache } from './competition-field-control.cache'
import { DriverStartEvent } from './driver-start.event'
import { AutonEndEvent } from './auton-end.event'
import { DriverEndEvent } from './driver-end.event'
import { TimingService } from './timing.service'
import { MatchModule } from '../match/match.module'

@Module({
  imports: [forwardRef(() => MatchModule), forwardRef(() => FieldControlModule), forwardRef(() => FieldModule),
    TypeOrmModule.forFeature([CompetitionFieldEntity])],
  providers: [CompetitionFieldService, CompetitionFieldControlService, CompetitionFieldRepo, EnableCompetitionFieldEvent,
    CompetitionFieldResolver, QueueSittingEvent, RemoveOnFieldSittingEvent, RemoveOnTableSittingEvent, UnqueueSittingEvent,
    PeriodEndEvent, PeriodStartEvent, AutonStartEvent, CompetitionFieldControlCache, DriverStartEvent, AutonEndEvent, DriverEndEvent,
    TimingService],
  exports: [CompetitionFieldService, QueueSittingEvent, RemoveOnFieldSittingEvent, UnqueueSittingEvent, DriverEndEvent]
})
export class CompetitionFieldModule {}
