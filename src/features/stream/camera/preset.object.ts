import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class Preset {
  @Field(() => Int)
    id: number

  @Field()
    name: string
}
