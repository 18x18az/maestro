import { ObjectType, Field as GField } from '@nestjs/graphql'
import { Match } from './match.object'
import { Contest } from './contest.object'
import { Block } from './block.object'
import { Field } from '../../field/field.object'

@ObjectType({ description: 'A sitting is an instance of a match being played. In case of a replay, another sitting is created for the same match.' })
export class Sitting {
  @GField(() => Number, { description: 'Unique identifier for the sitting' })
    id: number

  @GField(() => Number, { description: 'The number of the sitting. Indexed from 1' })
    sittingNumber: number

  @GField(() => Match, { description: 'The match this sitting is a part of' })
    match: Match

  @GField(() => Contest, { description: 'The contest this sitting is a part of' })
    contest: Contest

  @GField(() => Date, { description: 'The time the sitting is scheduled to be played', nullable: true })
    scheduled: Date

  @GField(() => Block, { description: 'The block this sitting is a part of' })
    block: Block

  @GField(() => Field, { description: 'The field this sitting will nominally be played on', nullable: true })
    field: Field
}
