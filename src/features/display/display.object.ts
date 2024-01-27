import { Field as GField, ObjectType } from '@nestjs/graphql'
import { Field } from '../field/field.object'

@ObjectType({ description: 'Control of remote displays' })
export class Display {
  @GField({ description: 'Unique identifier for the display' })
    uuid: string

  @GField({ description: 'Name of the display' })
    name: string

  @GField(() => Field, { description: 'The field that the display is currently assigned to', nullable: true })
    field: Field
}
