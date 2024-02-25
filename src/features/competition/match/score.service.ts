import { Injectable, Logger } from '@nestjs/common'
import { CalculableScore, StoredScore } from './score.interface'
import { AllianceScoreEdit, SavedAllianceScore } from './alliance-score.object'
import { Tier, Winner } from './match.interface'
import { ScoreEdit } from './score.object'

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
    matchId: match.matchId,
    isElim: match.isElim
  }
}

function makeEmptyAllianceScore (isElim: boolean): SavedAllianceScore {
  return {
    allianceInGoal: 0,
    allianceInZone: 0,
    triballsInGoal: 0,
    triballsInZone: 0,
    robot1Tier: Tier.NONE,
    robot2Tier: Tier.NONE,
    autoWp: isElim ? undefined : false
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

    const isElim = false

    const score = {
      red: makeEmptyAllianceScore(isElim),
      blue: makeEmptyAllianceScore(isElim),
      autoWinner: Winner.NONE,
      matchId,
      isElim
    }

    this.workingScores.set(matchId, score)
    return makeCalculableScore(score)
  }

  async updateScore (matchId: number, edit: ScoreEdit): Promise<CalculableScore> {
    const score = await this.getWorkingScore(matchId)
    const updated = { ...score, ...edit }
    this.workingScores.set(matchId, updated)
    return makeCalculableScore(updated)
  }

  async updateAllianceScore (matchId: number, color: string, edit: AllianceScoreEdit): Promise<CalculableScore> {
    const score = await this.getWorkingScore(matchId)

    const partToEdit = score[color]
    const edited = { ...partToEdit, ...edit }
    score[color] = edited
    this.workingScores.set(matchId, score)

    return makeCalculableScore(score)
  }
}
