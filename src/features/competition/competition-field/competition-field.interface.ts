import { Field } from '../../field/field'
import { Match } from '../match'

export enum MATCH_STAGE {
  EMPTY = 'EMPTY',
  QUEUED = 'QUEUED',
  AUTON = 'AUTON',
  SCORING_AUTON = 'SCORING_AUTON',
  DRIVER = 'DRIVER',
  OUTRO = 'OUTRO',
  SCORING = 'SCORING'
}

export interface CompetitionFieldStatus {
  field: Field
  onDeck: Match | null
  onField: Match | null
  stage: MATCH_STAGE
}
