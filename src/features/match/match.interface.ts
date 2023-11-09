export enum Round {
  QUAL = 'qual',
  Ro16 = 'ro16',
  QF = 'qf',
  SF = 'sf',
  F = 'f'
}

export interface MatchIdentifier {
  round: Round
  matchNumber: number
  sitting: number
}

export enum BlockStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED'
}

export enum MatchStatus {
  NOT_STARTED = 'NOT_STARTED',
  QUEUED = 'QUEUED',
  SCORING = 'SCORING',
  NEEDS_REPLAY = 'NEEDS_REPLAY',
  COMPLETE = 'COMPLETE'
}

export interface Alliance {
  team1: string
  team2?: string
}

export interface Match {
  id: number
  block: string
  number: number
  red: Alliance
  blue: Alliance
  fieldId?: number
  fieldName?: string
  status: MatchStatus
  round: Round
  sitting: number
}
