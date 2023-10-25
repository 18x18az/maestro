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

export interface Match {
  round: number
  matchNum: number
  sitting: number
  fieldId: number
  red1: string
  red2: string
  blue1: string
  blue2: string
  time?: Date
  status: MATCH_STATE
}

export interface MatchBlock {
  matches: Match[]
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

export enum BLOCK_STATE {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED'
}

export enum MATCH_STATE {
  NOT_STARTED = 'NOT_STARTED',
  ON_FIELD = 'ON_FIELD',
  SCORING = 'SCORING',
  RESOLVED = 'RESOLVED'
}

export enum OBS_CONTROL {
  ON_FIELD = 'ON_FIELD',
  SCORE = 'SCORE',
  CLEAN = 'CLEAN',
}
