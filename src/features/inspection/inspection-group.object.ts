import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Program } from './inspection.interface'
import { InspectionPoint, TeamInspectionPoint } from './inspection-point.object'

@ObjectType()
class BaseInspectionGroup {
  @Field(() => Int, { description: 'Unique identifier for the inspection group' })
    id: number

  @Field(() => Program, { description: 'Program the inspection group applies to' })
    program: Program

  @Field({ description: 'Title of the inspection group' })
    text: string
}

@ObjectType()
export class InspectionGroup extends BaseInspectionGroup {
  @Field(() => [InspectionPoint], { description: 'All inspection points for the group' })
    points: InspectionPoint[]
}

@ObjectType()
export class TeamInspectionGroup extends BaseInspectionGroup {
  @Field(() => [TeamInspectionPoint], { description: 'All inspection points applicable to the team' })
    points: TeamInspectionPoint[]

  @Field(() => [TeamInspectionPoint], { description: 'Unmet inspection points for the team' })
    unmetPoints: TeamInspectionPoint[]
}
