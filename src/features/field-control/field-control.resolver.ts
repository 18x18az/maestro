import { Args, Context, Field, Int, Mutation, Parent, ResolveField, Resolver, Subscription } from '@nestjs/graphql'
import { FieldControl } from './field-control.object'
import { FieldControlStatus } from './field-control.interface'
import { FieldService } from '../field/field.service'
import { FieldEntity } from '../field/field.entity'
import { FieldControlModel } from './field-control.model'
import { StartFieldEvent } from './start-field.event'
import { PubSub } from 'mercurius'
import { StopFieldEvent } from './stop-field.event'

@Resolver(() => FieldControl)
export class FieldControlResolver {
  constructor (
    private readonly fieldService: FieldService,
    private readonly startEvent: StartFieldEvent,
    private readonly stopEvent: StopFieldEvent
  ) {}

  @ResolveField()
  async isRunning (@Parent() field: FieldControlStatus): Promise<boolean> {
    return field.endTime !== null
  }

  @ResolveField(() => Field)
  async field (@Parent() field: FieldControlStatus): Promise<FieldEntity> {
    return await this.fieldService.getField(field.fieldId)
  }

  @Mutation(() => FieldControl)
  async startField (
    @Args({ type: () => Int, name: 'fieldId' }) fieldId: number,
      @Context('pubsub') pubSub: PubSub
  ): Promise<FieldControlModel> {
    const result = await this.startEvent.execute({ fieldId })
    pubSub.publish({ topic: 'fieldControl', payload: { fieldControl: result._control } })
    return result._control
  }

  @Mutation(() => FieldControl)
  async stopField (
    @Args({ type: () => Int, name: 'fieldId' }) fieldId: number,
      @Context('pubsub') pubSub: PubSub
  ): Promise<FieldControlModel> {
    const result = await this.stopEvent.execute({ fieldId })
    pubSub.publish({ topic: 'fieldControl', payload: { fieldControl: result._control } })
    return result._control
  }

  @Subscription(() => FieldControl, {
    filter: (payload, variables) => payload.fieldControl.fieldId === variables.fieldId
  })
  async fieldControl (
    @Args({ type: () => Int, name: 'fieldId' }) fieldId: number,
      @Context('pubsub') pubSub: PubSub
  ): Promise<AsyncIterator<FieldControlModel>> {
    return await pubSub.subscribe('fieldControl')
  }
}
