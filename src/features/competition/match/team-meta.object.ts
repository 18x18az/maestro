import { Field, ObjectType } from '@nestjs/graphql'
import { Team } from '../../team/team.object'

@ObjectType()
export class TeamMeta {
  @Field(() => Team)
    team: Team

  @Field()
    noShow: boolean

  @Field()
    dq: boolean
}
