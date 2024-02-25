import { ObjectType, Field, Int } from '@nestjs/graphql'
import { Contest } from './contest.object'
import { Sitting } from './sitting.object'
import { Score } from './score.object'
import { Winner } from './match.interface'

@ObjectType({ description: 'A match refers to a single scored match between two alliances. A match may have multiple sittings if it is replayed e.g. due to a field fault' })
export class Match {
  @Field(() => Int, { description: 'Unique identifier for the match' })
    id: number

  @Field(() => Int, { description: 'The number of the match. E.g. SF-2-1 is 1' })
    number: number

  @Field(() => Contest, { description: 'The contest this match is a part of' })
    contest: Contest

  @Field(() => [Sitting], { description: 'Sittings of the match' })
    sittings: Sitting[]

  @Field(() => Score, { description: 'The saved result of the match', nullable: true })
    savedScore?: Score

  @Field(() => Score, { description: 'The working result of the match' })
    workingScore: Score

  @Field(() => [Score], { description: 'The history of match scores' })
    scoreHistory: Score[]

  @Field(() => Winner, { description: 'The winner of the match' })
    winner: Winner
}
