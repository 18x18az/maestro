import { Injectable, Logger } from '@nestjs/common'
import { CalculableScore, StoredScore } from './score.interface'
import { SavedAllianceScore } from './alliance-score.object'
import { Winner } from './match.interface'

function makeCalculableScore (match: StoredScore): CalculableScore {
  return {
    red: {
      ...match.red,
      color: 'red',
      autoWinner: match.autoWinner,
      opponent: match.blue
    },
    blue: {
      ...match.blue,
      color: 'blue',
      autoWinner: match.autoWinner,
      opponent: match.red
    },
    autoWinner: match.autoWinner,
    savedAt: match.savedAt,
    matchId: match.matchId
  }
}

@Injectable()
export class ScoreService {
  private readonly logger = new Logger(ScoreService.name)
  private readonly workingScores = new Map<number, StoredScore>()

  async getWorkingScore (matchId: number): Promise<CalculableScore> {
    const existing = this.workingScores.get(matchId)

    if (existing !== undefined) {
      return makeCalculableScore(existing)
    }

    this.logger.log(`Creating new working score for match ${matchId}`)

    const score = {
      red: new SavedAllianceScore(),
      blue: new SavedAllianceScore(),
      autoWinner: Winner.NONE,
      matchId
    }

    this.workingScores.set(matchId, score)
    return makeCalculableScore(score)
  }
}
