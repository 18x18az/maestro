import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Tier, Winner } from './match.interface'
import { TeamMeta } from './team-meta.object'

@ObjectType()
export class SavedAllianceScore {
  @Field(() => Int)
    allianceInGoal: number = 0

  @Field(() => Int)
    allianceInZone: number = 0

  @Field(() => Int)
    triballsInGoal: number = 0

  @Field(() => Int)
    triballsInZone: number = 0

  @Field(() => Tier)
    robot1Tier: Tier = Tier.NONE

  @Field(() => Tier)
    robot2Tier: Tier = Tier.NONE

  @Field({ nullable: true })
    autoWp?: boolean
}

export class CalculableAllianceScore extends SavedAllianceScore {
  color: 'red' | 'blue'
  autoWinner: Winner
  opponent: SavedAllianceScore
}

@ObjectType()
export class AllianceScore extends SavedAllianceScore {
  @Field(() => Int)
    score: number

  @Field(() => [TeamMeta])
    teams: TeamMeta[]
}
