import { Field, InputType, Int, ObjectType, PartialType } from '@nestjs/graphql'
import { Checkin } from './team.interface'
import { TeamInspectionGroup } from '../inspection/inspection-group.object'
import { InspectionRollup } from '../inspection/inspection.interface'

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
  @Field(() => Checkin, { description: 'Checkin status of the team' })
    checkin: Checkin
}

@ObjectType()
export class Team extends TeamInfo {
  @Field(() => Int, { description: 'Unique identifier for the team' })
    id: number

  @Field(() => Int, { description: 'Rank of the team', nullable: true })
    rank: number

  @Field(() => InspectionRollup, { description: 'Inspection status of the team' })
    inspectionStatus: InspectionRollup

  @Field(() => [TeamInspectionGroup], { description: 'All inspection groups applicable to the team' })
    inspection: TeamInspectionGroup[]

  @Field(() => [TeamInspectionGroup], { description: 'All inspection groups containing points not met by the team' })
    unmetInspection: TeamInspectionGroup[]
}

@InputType()
export class TeamUpdate extends PartialType(TeamInfo) {}
