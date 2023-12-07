import { TmModule } from '@/utils'
import { Module } from '@nestjs/common'
import { ResultsInternal } from './results.internal'
import { StageModule } from '../stage'
import { CompetitionModule } from '../competition'
import { MatchModule } from '../competition/match'

@Module({
  imports: [TmModule, StageModule, CompetitionModule, MatchModule],
  providers: [ResultsInternal]
})
export class ResultsModule { }
