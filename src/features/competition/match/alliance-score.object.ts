import { Field, InputType, Int, ObjectType, PartialType } from '@nestjs/graphql'
import { Tier, Winner } from './match.interface'
import { TeamMeta } from './team-meta.object'

@InputType()
@ObjectType()
export class SavedAllianceScore {
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

@InputType()
export class AllianceScoreEdit extends PartialType(SavedAllianceScore) {}

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
