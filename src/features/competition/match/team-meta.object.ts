import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql'
import { Team } from '../../team/team.object'

@InputType()
@ObjectType()
class TeamMetaBase {
  @Field()
    noShow: boolean

  @Field()
    dq: boolean
}

@InputType()
export class TeamMetaEdit extends PartialType(TeamMetaBase) {}

@ObjectType()
export class TeamMeta extends TeamMetaBase {
  @Field(() => Team)
    team: Team
}
