import { Field, InputType, Int, ObjectType, PartialType } from '@nestjs/graphql'
import { Checkin } from './team.interface'

@InputType()
@ObjectType()
export class TeamCreate {
  @Field({ description: 'Number of the team' })
    number: string
}

@InputType()
@ObjectType()
class TeamInfo extends TeamCreate {
  @Field(() => Checkin, { description: 'Checkin status of the team' })
    checkin: Checkin
}

@ObjectType()
export class Team extends TeamInfo {
  @Field(() => Int, { description: 'Unique identifier for the team' })
    id: number
}

@InputType()
export class TeamUpdate extends PartialType(TeamInfo) {}
