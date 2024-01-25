import { Module, forwardRef } from '@nestjs/common'
import { ResultsInternal } from './results.internal'
import { TmModule } from '../../utils/tm/tm.module'
import { MatchModule } from '../competition/match/match.module'
import { StageModule } from '../stage/stage.module'
import { CompetitionModule } from '../competition/competition/competition.module'
import { ResultsResolver } from './results.resolver'

@Module({
  imports: [TmModule, StageModule, forwardRef(() => MatchModule), forwardRef(() => CompetitionModule)],
  providers: [ResultsInternal, ResultsResolver]
})
export class ResultsModule { }
