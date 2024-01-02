import { ObjectType, Field as GField, Int } from '@nestjs/graphql'
import { Contest } from './contest.object'
import { Sitting } from './sitting.object'

@ObjectType({ description: 'A match refers to a single scored match between two alliances. A match may have multiple sittings if it is replayed e.g. due to a field fault' })
export class Match {
  @GField(() => Int, { description: 'Unique identifier for the match' })
    id: number

  @GField(() => Int, { description: 'The number of the match. E.g. SF-2-1 is 2' })
    number: number

  @GField(() => Contest, { description: 'The contest this match is a part of' })
    contest: Contest

  @GField(() => [Sitting], { description: 'Sittings of the match' })
    sittings: Sitting[]
}
