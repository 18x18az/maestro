import { Module, forwardRef } from '@nestjs/common'
import { RankingCache } from './ranking.cache'
import { RankingService } from './ranking.service'
import { RankingsUpdateEvent } from './ranking-update.event'
import { MatchModule } from '../competition/match/match.module'

@Module({
  imports: [forwardRef(() => MatchModule)],
  providers: [RankingCache, RankingService, RankingsUpdateEvent],
  exports: [RankingService, RankingsUpdateEvent]
})
export class RankingModule {}
