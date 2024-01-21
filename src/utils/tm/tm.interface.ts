import { registerEnumType } from '@nestjs/graphql'
import { Alliance, Round } from '../../features/competition/match/match.interface'

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

export interface MatchIdentifier {
  round: Round
  contest: number
  match: number
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

export enum TmStatus {
  INITIALIZING = 'INITIALIZING',
  NOT_CONFIGURED = 'NOT_CONFIGURED',
  DISCONNECTED = 'DISCONNECTED',
  CONNECTED = 'CONNECTED',
}

registerEnumType(TmStatus, { name: 'TmStatus' })
