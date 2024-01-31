import { Field, InputType, Int, ObjectType, PartialType } from '@nestjs/graphql'
import { Inspection } from './team.interface'
import { TeamInspectionGroup } from '../inspection/inspection-group.object'

@InputType()
@ObjectType()
export class TeamCreate {
  @Field({ description: 'Number of the team' })
    number: string

  @Field({ description: 'Name of the team' })
    name: string

  @Field({ description: 'Location of the team' })
    location: string

  @Field({ description: 'School of the team' })
    school: string
}

@InputType()
@ObjectType()
class TeamInfo extends TeamCreate {
  @Field(() => Inspection, { description: 'Inspection status of the team' })
    inspectionStatus: Inspection
}

@ObjectType()
export class Team extends TeamInfo {
  @Field(() => Int, { description: 'Unique identifier for the team' })
    id: number

  @Field(() => Int, { description: 'Rank of the team', nullable: true })
    rank: number

  @Field(() => [TeamInspectionGroup], { description: 'All inspection groups applicable to the team' })
    inspection: TeamInspectionGroup[]

  @Field(() => [TeamInspectionGroup], { description: 'All inspection groups containing points not met by the team' })
    unmetInspection: TeamInspectionGroup[]
}

@InputType()
export class TeamUpdate extends PartialType(TeamInfo) {}
