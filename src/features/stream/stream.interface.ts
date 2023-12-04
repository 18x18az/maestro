import { Match } from '../competition/match'

export interface DisplayedResults {
  match: Match
  redScore: number
  blueScore: number
}

export enum StreamDisplayStage {
  UNKNOWN = 'UNKNOWN',
  MATCH = 'MATCH',
  RESULTS = 'RESULTS',
  TRANSITIONING = 'TRANSITIONING',
}
