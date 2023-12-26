import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class FieldObject {
  @Field(() => Int)
    id: number

  @Field()
    name: string

  @Field()
    enabled: boolean

  @Field()
    isComp: boolean

  @Field()
    isSkills: boolean
}
