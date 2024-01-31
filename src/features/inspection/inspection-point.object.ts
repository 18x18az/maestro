import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Program } from './inspection.interface'
import { InspectionGroup } from './inspection-group.object'

@ObjectType()
export class InspectionPoint {
  @Field(() => Int, { description: 'Unique identifier for the inspection point' })
    id: number

  @Field(() => String, { description: 'Text of the inspection point' })
    text: string

  @Field(() => Program, { description: 'Program the inspection point applies to' })
    program: Program

  @Field(() => InspectionGroup, { description: 'Group the inspection point belongs to' })
    group: InspectionGroup
}

@ObjectType()
export class TeamInspectionPoint extends InspectionPoint {
  @Field(() => Boolean, { description: 'Whether the team has met the inspection point' })
    met: boolean
}
