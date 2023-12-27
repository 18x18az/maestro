import { Field as GField, Int, ObjectType } from '@nestjs/graphql'
import { FieldControl } from '../field-control/field-control.object'

@ObjectType({ description: 'Representation of a single field' })
export class Field {
  @GField(() => Int, { description: 'Unique identifier for the field' })
    id: number

  @GField({ description: 'Name of the field' })
    name: string

  @GField({ description: 'Whether the field is enabled for use' })
    isEnabled: boolean

  @GField({ description: 'Whether the field is allocated as a competition field. Can be true even if the field is disabled.' })
    isCompetition: boolean

  @GField({ description: 'Whether or not the field can be used for skills. Can be true even if the field is disabled.' })
    canRunSkills: boolean

  @GField({ description: 'Whether or not the field is allocated as a dedicated skills field. Can be true even if the field is disabled.' })
    isSkills: boolean

  @GField({ nullable: true, description: 'The current state of field control on the field. Null if the field is disabled.' })
    fieldControl: FieldControl
}
