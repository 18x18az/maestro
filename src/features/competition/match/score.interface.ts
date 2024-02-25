import { SavedAllianceScore } from './alliance-score.object'
import { Winner } from './match.interface'

export interface StoredScore {
  red: SavedAllianceScore
  blue: SavedAllianceScore
  autoWinner: Winner
  savedAt?: Date
}
