import { Module } from '@nestjs/common'
import { ResultsInternal } from './results.internal'
import { StageModule } from '../stage'
import { TmModule } from '../../utils/tm/tm.module'
import { MatchModule } from '../competition/match/match.module'

@Module({
  imports: [TmModule, StageModule, MatchModule],
  providers: [ResultsInternal]
})
export class ResultsModule { }
