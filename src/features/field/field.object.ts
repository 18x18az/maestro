import { Field as GField, Int, ObjectType } from '@nestjs/graphql'
import { FieldControl } from '../field-control/field-control.object'
import { CompetitionField } from '../competition/competition-field/competition-field.object'
import { Skills } from '../skills/skills.object'
import { Scene } from '../stream/switcher/scene.object'

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

  @GField({ nullable: true, description: 'Information about competition matches associated with this field. Null if the field is not being used for competition matches.' })
    competition?: CompetitionField

  @GField({ nullable: true, description: 'Information about skills matches associated with this field. Null if the field is not being used for skills matches.' })
    skills?: Skills

  @GField({ description: 'The scene which displays the field', nullable: true })
    scene: Scene
}
