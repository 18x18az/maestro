import { registerEnumType } from '@nestjs/graphql'

export enum Tier {
  NONE = '',
  A = 'a',
  B = 'b',
  C = 'c',
  D = 'd',
  E = 'e',
  F = 'f',
  G = 'g',
  H = 'h',
  I = 'i',
  J = 'j'
}

registerEnumType(Tier, {
  name: 'Tier',
  description: 'Elevation tier of the robot'
})

export enum Winner {
  RED = 'red',
  BLUE = 'blue',
  TIE = 'tie',
  NONE = 'none'
}

registerEnumType(Winner, {
  name: 'Winner',
  description: 'The winner of a particular contest'
})

export enum Round {
  QUAL = 'qual',
  Ro16 = 'ro16',
  QF = 'qf',
  SF = 'sf',
  F = 'f'
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
