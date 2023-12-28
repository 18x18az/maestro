import { Field, ObjectType } from '@nestjs/graphql'
import { EventStage } from './stage.interface'

@ObjectType()
export class Stage {
  @Field(() => EventStage, { description: 'The current stage of the event' })
    stage: EventStage
}
