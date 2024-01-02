import { ObjectType, Field as GField } from '@nestjs/graphql'
import { BlockStatus } from './match.interface'
import { Sitting } from './sitting.object'

@ObjectType({ description: 'A block refers to a group of match sittings played in the same stretch of time, e.g. all quals played in the morning before lunch' })
export class Block {
  @GField(() => Number, { description: 'Unique identifier for the block' })
    id: number

  @GField(() => String, { description: 'The name of the block' })
    name: string

  @GField(() => BlockStatus, { description: 'Status of the block' })
    status: BlockStatus

  @GField(() => [Sitting], { description: 'Sittings in the block' })
    sittings: Sitting[]
}
