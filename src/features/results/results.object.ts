import { Field, ObjectType } from '@nestjs/graphql'
import { Match } from '../competition/match/match.object'

@ObjectType()
export class Results {
  @Field(() => Match, { nullable: true })
    displayedResults?: Match

  @Field(() => Match, { nullable: true })
    nextResults?: Match
}
