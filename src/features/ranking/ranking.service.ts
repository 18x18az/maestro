import { Injectable } from '@nestjs/common'
import { RankingCache } from './ranking.cache'
import { TmConnectedEvent } from '../../utils/tm/tm-connected.event'
import { RankingsUpdateEvent } from './ranking-update.event'
import { MatchResultEvent } from '../competition/match/match-result.event'

@Injectable()
export class RankingService {
  constructor (
    private readonly cache: RankingCache,
    private readonly tmConnect: TmConnectedEvent,
    private readonly updateRankings: RankingsUpdateEvent,
    private readonly resultUpdate: MatchResultEvent
  ) {}

  onModuleInit (): void {
    this.tmConnect.registerOnComplete(async () => {
      if (this.cache.isLoaded()) return

      await this.updateRankings.execute({})
    })

    this.resultUpdate.registerOnComplete(async () => {
      await this.updateRankings.execute({})
    })
  }

  getRanking (team: string): number | null {
    return this.cache.getRanking(team)
  }
}
