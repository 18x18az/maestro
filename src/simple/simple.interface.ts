export enum STAGE {
  WAITING_FOR_TEAMS = 'WAITING_FOR_TEAMS',
  WAITING_FOR_MATCHES = 'WAITING_FOR_MATCHES',
  QUAL_MATCHES = 'QUAL_MATCHES',
}

export interface Team {
  number: string
  name: string
  location: string
  school: string
}

export interface QualMatch {
  matchNum: number
  fieldId: number
  red1: string
  red2: string
  blue1: string
  blue2: string
  time: Date
}

export interface QualBlock {
  matches: QualMatch[]
}
