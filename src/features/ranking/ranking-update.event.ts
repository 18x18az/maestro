import { Injectable } from '@nestjs/common'
import { EventService } from '../../utils/classes/event-service'
import { TmService } from '../../utils/tm/tm.service'
import { RankingCache } from './ranking.cache'

interface RankingsUpdateResult {
  rankings: string[]
}

@Injectable()
export class RankingsUpdateEvent extends EventService<{}, {}, RankingsUpdateResult> {
  constructor (
    private readonly tm: TmService,
    private readonly cache: RankingCache
  ) { super() }

  protected async doExecute (): Promise<RankingsUpdateResult> {
    const rankings = await this.tm.getRankings()
    this.cache.updateRankings(rankings)
    return { rankings }
  }
}
