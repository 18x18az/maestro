import { EventService } from '../../utils/classes/event-service'
import { FieldControlEndCb } from './field-control.interface'
import { FieldControlModel } from './field-control.model'
import { FieldControlService } from './field-control.service'

export interface StartFieldPayload {
  fieldId: number
  _endCb?: FieldControlEndCb
}

export interface StartFieldContext extends StartFieldPayload {
  _control: FieldControlModel
}

export class StartFieldEvent extends EventService<StartFieldPayload, StartFieldContext, StartFieldContext> {
  constructor (private readonly service: FieldControlService) { super() }

  protected async getContext (data: StartFieldPayload): Promise<StartFieldContext> {
    const control = await this.service.getOrCreateField(data.fieldId)
    return { ...data, _control: control }
  }

  protected async doExecute (data: StartFieldContext): Promise<StartFieldContext> {
    await data._control.start(data._endCb)
    return data
  }
}