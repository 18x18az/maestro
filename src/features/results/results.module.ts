import { Module, forwardRef } from '@nestjs/common'
import { ResultsInternal } from './results.internal'
import { TmModule } from '../../utils/tm/tm.module'
import { MatchModule } from '../competition/match/match.module'
import { StageModule } from '../stage/stage.module'

@Module({
  imports: [TmModule, StageModule, forwardRef(() => MatchModule)],
  providers: [ResultsInternal]
})
export class ResultsModule { }
