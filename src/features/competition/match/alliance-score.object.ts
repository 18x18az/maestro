import { Field, InputType, Int, ObjectType, PartialType } from '@nestjs/graphql'
import { Tier, Winner } from './match.interface'
import { TeamMeta } from './team-meta.object'

@InputType()
@ObjectType()
class BaseAllianceScore {
  @Field(() => Int)
    allianceInGoal: number

  @Field(() => Int)
    allianceInZone: number

  @Field(() => Int)
    triballsInGoal: number

  @Field(() => Int)
    triballsInZone: number

  @Field(() => Tier)
    robot1Tier: Tier

  @Field(() => Tier)
    robot2Tier: Tier

  @Field({ nullable: true })
    autoWp?: boolean
}

export interface SavedTeamMeta {
  teamId: number
  noShow: boolean
  dq: boolean
}

export class SavedAllianceScore extends BaseAllianceScore {
  teams: SavedTeamMeta[]
}

@InputType()
export class AllianceScoreEdit extends PartialType(BaseAllianceScore) {}

export class CalculableAllianceScore extends SavedAllianceScore {
  color: 'red' | 'blue'
  autoWinner: Winner
  opponent: BaseAllianceScore
}

@ObjectType()
export class AllianceScore extends BaseAllianceScore {
  @Field(() => Int)
    score: number

  @Field(() => [TeamMeta])
    teams: TeamMeta[]
}
