import { Field } from '../field/field.interface'
import { ScheduledMatch } from '../match'

export enum FieldState {
  IDLE = 'IDLE'
}

export interface FieldStatus {
  field: Field
  state: FieldState
  match: ScheduledMatch | null
}
