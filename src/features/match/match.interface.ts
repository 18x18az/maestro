export enum Round {
  QUAL = 'qual',
  Ro16 = 'ro16',
  QF = 'qf',
  SF = 'sf',
  F = 'f'
}

export const QUAL_LIST_TOPIC = 'quals'
export const QUAL_BLOCK_TOPIC = 'qualblocks'
export const CURRENT_BLOCK_TOPIC = 'currentblock'

export interface Alliance {
  team1: string
  team2: string
}

export interface MatchIdentifier {
  round: Round
  matchNum: number
  sitting: number
}

export interface Match extends MatchIdentifier {
  id: number
  red: Alliance
  blue: Alliance
}

export enum ReplayStatus {
  NOT_STARTED = 'NOT_STARTED',
  ON_DECK = 'ON_DECK',
  AWAITING_SCORES = 'AWAITING_SCORES',
  RESOLVED = 'RESOLVED'
}

export interface ScheduledMatch extends Match {
  replayId: number
  fieldId: number
  fieldName: string
  replay: number
  time?: string
  status: ReplayStatus
}

export enum BlockStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED'
}

export interface MatchBlock {
  id: number
  status: BlockStatus
  matches: ScheduledMatch[]
}
