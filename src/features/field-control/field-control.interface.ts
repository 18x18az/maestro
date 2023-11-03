import { Field } from '../field/field.interface'
import { ScheduledMatch } from '../match'

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

export interface FieldStatus {
  field: Field
  state: FieldState
  match: ScheduledMatch | null
}
