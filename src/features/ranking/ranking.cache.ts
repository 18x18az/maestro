import { Injectable } from '@nestjs/common'

@Injectable()
export class RankingCache {
  private rankings: string[] = []

  getRanking (team: string): number | null {
    const rank = this.rankings.findIndex(ranking => ranking === team)

    if (rank === -1) return null

    return rank + 1
  }

  isLoaded (): boolean {
    return this.rankings.length > 0
  }

  updateRankings (rankings: string[]): void {
    this.rankings = rankings
  }
}
