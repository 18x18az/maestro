import { Module, forwardRef } from '@nestjs/common'
import { RankingCache } from './ranking.cache'
import { RankingService } from './ranking.service'
import { TmModule } from '../../utils/tm/tm.module'
import { RankingsUpdateEvent } from './ranking-update.event'
import { MatchModule } from '../competition/match/match.module'

@Module({
  imports: [forwardRef(() => TmModule), forwardRef(() => MatchModule)],
  providers: [RankingCache, RankingService, RankingsUpdateEvent],
  exports: [RankingService]
})
export class RankingModule {}
