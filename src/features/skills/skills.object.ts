import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class Skills {
  @Field({ nullable: true })
    stopTime?: number

  @Field()
    fieldId: number
}
