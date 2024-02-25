import { Field, ObjectType } from '@nestjs/graphql'
import { AllianceScore } from './alliance-score.object'
import { Winner } from './match.interface'
import { Match } from './match.object'

@ObjectType()
export class Score {
  @Field(() => AllianceScore)
    red: AllianceScore

  @Field(() => AllianceScore)
    blue: AllianceScore

  @Field(() => Winner, { description: 'The winner of the autonomous period, empty if auto has not been scored', nullable: true })
    autoWinner?: Winner

  @Field(() => Winner)
    winner: Winner

  @Field({ description: 'A string representation of the score for entry into TM' })
    entryString: string

  @Field(() => Date, { nullable: true, description: 'The date the score was saved at. Empty if the score is a working score' })
    savedAt?: Date

  @Field(() => Match, { description: 'The match this score is for' })
    match: Match

  @Field({ description: 'Whether the score is for an elimination match' })
    isElim: boolean
}
