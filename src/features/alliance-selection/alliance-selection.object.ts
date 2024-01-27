import { Field, ObjectType } from '@nestjs/graphql'
import { Team } from '../team/team.object'

@ObjectType()
export class AllianceSelection {
  @Field(() => Team, { nullable: true, description: 'The team that is currently picking' })
    picking: Team | null

  @Field(() => Team, { nullable: true, description: 'The team that has been picked' })
    picked: Team | null

  @Field(() => [Team], { description: 'The teams that are still eligible to be picked' })
    pickable: Team[]

  @Field(() => [[Team, Team]], { description: 'The alliances that have been formed' })
    alliances: [[Team, Team]]

  @Field(() => [Team], { description: 'The teams that are not yet part of an alliance' })
    remaining: Team[]
}
