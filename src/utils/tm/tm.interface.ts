import { Alliance, MatchIdentifier } from '../../features/competition/match'

export interface TeamInformation {
  number: string
  name: string
  location: string
  school: string
}

export const TeamsTopic = 'teams'

export interface TmReturn {
  matches: ElimsMatch[]
  results: MatchResult[]
}

export interface MatchResult {
  identifier: MatchIdentifier
  redScore: number
  blueScore: number
}

export interface ElimsMatch {
  identifier: MatchIdentifier
  red: Alliance
  blue: Alliance
}
