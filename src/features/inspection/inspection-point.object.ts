import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Program } from './inspection.interface'
import { InspectionGroup } from './inspection-group.object'

@ObjectType()
export class InspectionPoint {
  @Field(() => Int)
    id: number

  @Field()
    text: string

  @Field(() => Program)
    program: Program

  @Field(() => InspectionGroup)
    group: InspectionGroup
}
