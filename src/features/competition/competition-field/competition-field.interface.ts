import { registerEnumType } from '@nestjs/graphql'
import { FieldEntity } from '../../field/field.entity'
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

registerEnumType(MATCH_STAGE, { name: 'MatchStage' })

export interface CompetitionFieldStatus {
  field: FieldEntity
  onDeck: Match | null
  onField: Match | null
  stage: MATCH_STAGE
}
