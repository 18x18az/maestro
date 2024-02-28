import { ObjectType, Field } from '@nestjs/graphql'
import { Round, Winner } from './match.interface'
import { Team } from '../../team/team.object'
import { Match } from './match.object'

@ObjectType({ description: 'A contest refers to a match or group of matches between two alliances. E.g. in Bo3 finals, F1 and F2 are both part of the same contest' })
export class Contest {
  @Field(() => Number, { description: 'Unique identifier for the contest' })
    id: number

  @Field(() => Round, { description: 'The round of the contest' })
    round: Round

  @Field(() => Number, { description: 'The number of the contest' })
    number: number

  @Field(() => [Team], { description: 'The red alliance', nullable: true })
    redTeams?: Team[]

  @Field(() => [Team], { description: 'The blue alliance', nullable: true })
    blueTeams?: Team[]

  @Field(() => [Match], { description: 'The matches in this contest' })
    matches: Match[]

  @Field(() => Winner, { description: 'The winner of the contest' })
    winner: Winner
}
