import { Module, forwardRef } from '@nestjs/common'
import { QualService } from './qual.service'
import { MatchRepo } from './match.repo'
import { MatchInternal } from './match.internal'
import { MatchService } from './match.service'
import { FieldModule } from '../../field/field.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MatchEntity } from './match.entity'
import { BlockEntity } from './block.entity'
import { MatchController } from './match.controller'
import { TeamModule } from '../../team/team.module'
import { SittingEntity } from './sitting.entity'
import { ContestEntity } from './contest.entity'
import { BlockResolver } from './block.resolver'
import { ContestResolver } from './contest.resolver'
import { MatchResolver } from './match.resolver'
import { SittingResolver } from './sitting.resolver'
import { MatchResultEvent } from './match-result.event'
import { SittingCompleteEvent } from './sitting-complete.event'
import { SittingScoredEvent } from './sitting-scored.event'
import { StageModule } from '../../stage/stage.module'
import { CompetitionFieldModule } from '../competition-field/competition-field.module'
import { ScoreService } from './score.service'
import { AllianceScoreResolver } from './alliance-score.resolver'
import { ScoreResolver } from './score.resolver'

@Module({
  imports: [TeamModule, StageModule, forwardRef(() => FieldModule), forwardRef(() => CompetitionFieldModule),
    TypeOrmModule.forFeature([MatchEntity, SittingEntity, ContestEntity, BlockEntity])
  ],
  controllers: [MatchController],
  providers: [
    QualService,
    MatchRepo,
    MatchInternal,
    MatchService,
    BlockResolver,
    ContestResolver,
    MatchResolver,
    SittingResolver,
    MatchResultEvent,
    SittingCompleteEvent,
    SittingScoredEvent,
    ScoreService,
    AllianceScoreResolver,
    ScoreResolver
  ],
  exports: [MatchService, MatchResultEvent, SittingCompleteEvent]
})
export class MatchModule {}
