import { Field, ObjectType } from '@nestjs/graphql'
import { AllianceScore } from './alliance-score.object'
import { Winner } from './match.interface'

@ObjectType()
export class Score {
  @Field(() => AllianceScore)
    red: AllianceScore

  @Field(() => AllianceScore)
    blue: AllianceScore

  @Field(() => Winner)
    autoWinner: Winner

  @Field(() => Winner)
    winner: Winner

  @Field({ description: 'A string representation of the score for entry into TM' })
    entryString: string

  @Field(() => Date, { nullable: true, description: 'The date the score was saved at. Empty if the score is a working score' })
    savedAt?: Date
}
