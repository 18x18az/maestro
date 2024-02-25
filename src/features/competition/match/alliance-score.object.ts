import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Tier } from './match.interface'
import { TeamMeta } from './team-meta.object'

@ObjectType()
export class AllianceScore {
  @Field(() => Int)
    score: number

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

  @Field(() => [TeamMeta])
    teams: TeamMeta[]
}
