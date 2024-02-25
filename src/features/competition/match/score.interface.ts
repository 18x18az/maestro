import { CalculableAllianceScore, SavedAllianceScore } from './alliance-score.object'
import { Winner } from './match.interface'

export interface StoredScore {
  red: SavedAllianceScore
  blue: SavedAllianceScore
  autoWinner: Winner
  savedAt?: Date
}

export interface CalculableScore {
  red: CalculableAllianceScore
  blue: CalculableAllianceScore
  autoWinner: Winner
  savedAt?: Date
}
