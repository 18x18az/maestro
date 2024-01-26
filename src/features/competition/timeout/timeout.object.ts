import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class Timeout {
  @Field(() => GraphQLISODateTime, { nullable: true, description: 'The time that the timeout will end, null if there is no timeout.' })
    endTime: Date | null
}
