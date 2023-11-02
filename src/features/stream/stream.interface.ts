import { ScheduledMatch } from '../match'

export interface DisplayedResults {
  match: ScheduledMatch
  redScore: number
  blueScore: number
}

export enum StreamDisplayStage {
  UNKNOWN = 'UNKNOWN',
  MATCH = 'MATCH',
  RESULTS = 'RESULTS',
  TRANSITIONING = 'TRANSITIONING',
}
