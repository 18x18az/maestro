import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Team } from '../team/team.object'

@ObjectType()
export class Award {
  @Field(() => Int, { description: 'Unique identifier for the award' })
    id: number

  @Field({ description: 'Name of the award' })
    name: string

  @Field(() => [Team], { nullable: true, description: 'The team(s) that won the award' })
    winners: Team[]
}
