export enum STAGE {
  WAITING_FOR_TEAMS = 'WAITING_FOR_TEAMS',
  WAITING_FOR_MATCHES = 'WAITING_FOR_MATCHES',
  QUAL_MATCHES = 'QUAL_MATCHES',
}

export interface MatchIdentifier {
  round: number
  match: number
  sitting: number
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

export interface MatchResult extends MatchIdentifier {
  redScore: number
  blueScore: number
}

export interface Field {
  id: number
  name: string
}

export enum FieldState {
  IDLE = 'IDLE',
  ON_DECK = 'ON_DECK',
  AUTO = 'AUTO',
  PAUSED = 'PAUSED',
  DRIVER = 'DRIVER',
  SCORING = 'SCORING',
  PROG_SKILLS = 'PROG_SKILLS',
  DRIVER_SKILLS = 'DRIVER_SKILLS',
}

export interface Alliance {
  team1: string
  team2?: string
}

export interface FieldStatus extends Field {
  state: FieldState
  time?: Date
  redAlliance?: Alliance
  blueAlliance?: Alliance
  match?: MatchIdentifier
}
