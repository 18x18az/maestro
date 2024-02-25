import { Injectable } from '@nestjs/common'
import { RankingCache } from './ranking.cache'

@Injectable()
export class RankingService {
  constructor (
    private readonly cache: RankingCache
  ) {}

  getRanking (team: string): number | null {
    return this.cache.getRanking(team)
  }

  getRankings (): string[] {
    return this.cache.getRankings()
  }
}
