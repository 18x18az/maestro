import { ObjectType, Field as GField } from '@nestjs/graphql'
import { Round } from './match.interface'
import { Team } from '../../team/team.object'
import { Match } from './match.object'

@ObjectType({ description: 'A contest refers to a match or group of matches between two alliances. E.g. in Bo3 finals, F1 and F2 are both part of the same contest' })
export class Contest {
  @GField(() => Number, { description: 'Unique identifier for the contest' })
    id: number

  @GField(() => Round, { description: 'The round of the contest' })
    round: Round

  @GField(() => Number, { description: 'The number of the contest' })
    number: number

  @GField(() => [Team], { description: 'The red alliance' })
    redTeams: Team[]

  @GField(() => [Team], { description: 'The blue alliance' })
    blueTeams: Team[]

  @GField(() => [Match], { description: 'The matches in this contest' })
    matches: Match[]
}
