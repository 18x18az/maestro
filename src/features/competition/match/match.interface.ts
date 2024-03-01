import { registerEnumType } from '@nestjs/graphql'

export enum Round {
  QUAL = 'QUAL',
  Ro16 = 'Ro16',
  QF = 'QF',
  SF = 'SF',
  F = 'F'
}

registerEnumType(Round, {
  name: 'Round',
  description: 'The round of the match'
})

export enum BlockStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED'
}

registerEnumType(BlockStatus, {
  name: 'BlockStatus',
  description: 'The status of a block of matches'
})

export enum SittingStatus {
  NOT_STARTED = 'NOT_STARTED',
  QUEUED = 'QUEUED',
  SCORING = 'SCORING',
  COMPLETE = 'COMPLETE'
}

registerEnumType(SittingStatus, {
  name: 'MatchStatus',
  description: 'The status of a match'
})

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
  status: SittingStatus
  round: Round
  sitting: number
  time?: string
}
