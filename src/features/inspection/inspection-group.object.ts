import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Program } from './inspection.interface'
import { InspectionPoint } from './inspection-point.object'

@ObjectType()
export class InspectionGroup {
  @Field(() => Int)
    id: number

  @Field(() => Program)
    program: Program

  @Field()
    text: string

  @Field(() => [InspectionPoint])
    points: InspectionPoint[]
}
