import { Module } from '@nestjs/common'
import { ResultsInternal } from './results.internal'
import { StageModule } from '../stage'
import { MatchModule } from '../competition/match'
import { TmModule } from '../../utils/tm'

@Module({
  imports: [TmModule, StageModule, MatchModule],
  providers: [ResultsInternal]
})
export class ResultsModule { }
