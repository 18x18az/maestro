import { Field as GField, GraphQLISODateTime, ObjectType } from '@nestjs/graphql'
import { CONTROL_MODE } from './field-control.interface'
import { Field } from '../field/field.object'

@ObjectType()
export class FieldControl {
  @GField(() => CONTROL_MODE, { nullable: true, description: 'The current mode of the field, null if undefined. Will still return a value even if it is not currently running.' })
    mode: CONTROL_MODE

  @GField(() => GraphQLISODateTime, { nullable: true, description: 'If the field is currently running, the time that the current running period will end.' })
    endTime?: string

  @GField({ description: 'Whether the field is currently running' })
    isRunning: boolean

  @GField(() => Field, { description: 'The field that this control object is associated with' })
    field: Field
}
