import { Injectable, Logger } from '@nestjs/common'
import { StoredScore } from './score.interface'
import { SavedAllianceScore } from './alliance-score.object'
import { Winner } from './match.interface'

@Injectable()
export class ScoreService {
  private readonly logger = new Logger(ScoreService.name)
  private readonly workingScores = new Map<number, StoredScore>()

  async getWorkingScore (matchId: number): Promise<StoredScore> {
    const existing = this.workingScores.get(matchId)

    if (existing !== undefined) {
      return existing
    }

    this.logger.debug(`Creating new working score for match ${matchId}`)

    const score = {
      red: new SavedAllianceScore(),
      blue: new SavedAllianceScore(),
      autoWinner: Winner.NONE
    }

    this.workingScores.set(matchId, score)
    return score
  }
}
