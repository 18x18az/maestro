import { CalculableAllianceScore, SavedAllianceScore } from './alliance-score.object'
import { Winner } from './match.interface'
export interface StoredScore {
  matchId: number
  red: SavedAllianceScore
  blue: SavedAllianceScore
  autoWinner: Winner
  savedAt?: Date
}

export interface CalculableScore {
  matchId: number
  red: CalculableAllianceScore
  blue: CalculableAllianceScore
  autoWinner: Winner
  savedAt?: Date
}
