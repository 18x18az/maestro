import { Field as GField, ObjectType } from '@nestjs/graphql'
import { Field } from '../../field/field.object'

@ObjectType()
export class Competition {
  @GField(() => Field, { nullable: true, description: 'The field that is currently live' })
    liveField?: Field

  @GField(() => Field, { nullable: true, description: 'The field that is currently on deck' })
    onDeckField?: Field
}
