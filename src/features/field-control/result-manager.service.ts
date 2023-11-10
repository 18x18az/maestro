import { MatchResult } from '@/utils'
import { Injectable } from '@nestjs/common'
import { DisplayedResults } from '../stream'
import { Match } from '../match'

@Injectable()
export class ResultManager {
  private mostRecentResult: DisplayedResults | null = null

  set (match: Match, result: MatchResult): void {
    this.mostRecentResult = {
      match,
      redScore: result.redScore,
      blueScore: result.blueScore
    }
  }

  get (): DisplayedResults | null {
    const result = this.mostRecentResult
    this.mostRecentResult = null
    return result
  }

  clear (): void {
    this.mostRecentResult = null
  }
}
