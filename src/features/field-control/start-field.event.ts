import { Injectable } from '@nestjs/common'
import { FieldControlModel } from './field-control.model'
import { EventService } from '../../utils/classes/event-service'
import { FieldControlService } from './field-control.service'
import { StopFieldEvent } from './stop-field.event'

export interface StartFieldPayload {
  fieldId: number
}

export interface StartFieldContext extends StartFieldPayload {
  _control: FieldControlModel
}

@Injectable()
export class StartFieldEvent extends EventService<StartFieldPayload, StartFieldContext, StartFieldContext> {
  constructor (
    private readonly service: FieldControlService,
    private readonly stopEvent: StopFieldEvent
  ) { super() }

  protected async getContext (data: StartFieldPayload): Promise<StartFieldContext> {
    const control = this.service.getFieldControl(data.fieldId)
    return { ...data, _control: control }
  }

  protected async doExecute (data: StartFieldContext): Promise<StartFieldContext> {
    data._control.start(this.stopEvent)
    return data
  }
}
