import { Injectable } from '@nestjs/common'
import { FieldControlModel } from './field-control.model'
import { EventService } from '../../utils/classes/event-service'
import { FieldControlService } from './field-control.service'

export interface StartFieldPayload {
  fieldId: number
}

export interface StartFieldContext extends StartFieldPayload {
  _control: FieldControlModel
}

@Injectable()
export class StartFieldEvent extends EventService<StartFieldPayload, StartFieldContext, StartFieldContext> {
  constructor (private readonly service: FieldControlService) { super() }

  protected async getContext (data: StartFieldPayload): Promise<StartFieldContext> {
    const control = await this.service.getOrCreateField(data.fieldId)
    return { ...data, _control: control }
  }

  protected async doExecute (data: StartFieldContext): Promise<StartFieldContext> {
    await data._control.start()
    return data
  }
}
