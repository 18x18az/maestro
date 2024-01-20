import { Args, Field, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { FieldControl } from './field-control.object'
import { FieldControlStatus } from './field-control.interface'
import { FieldService } from '../field/field.service'
import { FieldEntity } from '../field/field.entity'
import { FieldControlModel } from './field-control.model'
import { StartFieldEvent } from './start-field.event'

@Resolver(of => FieldControl)
export class FieldControlResolver {
  constructor (
    private readonly fieldService: FieldService,
    private readonly startEvent: StartFieldEvent
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
  async startField (@Args('fieldId') fieldId: number): Promise<FieldControlModel> {
    const result = await this.startEvent.execute({ fieldId })
    return result._control
  }
}
