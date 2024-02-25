import { CalculableAllianceScore, SavedAllianceScore } from './alliance-score.object'
import { Winner } from './match.interface'

interface MatchCommon {
  matchId: number
  autoWinner: Winner
  savedAt?: Date
  isElim: boolean
}
export interface StoredScore extends MatchCommon {
  red: SavedAllianceScore
  blue: SavedAllianceScore
}

export interface CalculableScore extends MatchCommon {
  red: CalculableAllianceScore
  blue: CalculableAllianceScore
}
