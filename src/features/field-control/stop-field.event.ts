import { Injectable } from '@nestjs/common'
import { FieldControlModel } from './field-control.model'
import { EventService } from '../../utils/classes/event-service'
import { FieldControlService } from './field-control.service'

export interface StopFieldPayload {
  fieldId: number
}

export interface StopFieldContext extends StopFieldPayload {
  _control: FieldControlModel
}

export interface StopFieldResult extends StopFieldContext {
  stopTime: number
}

@Injectable()
export class StopFieldEvent extends EventService<StopFieldPayload, StopFieldContext, StopFieldResult> {
  constructor (private readonly service: FieldControlService) { super() }

  protected async getContext (data: StopFieldPayload): Promise<StopFieldContext> {
    const control = this.service.getFieldControl(data.fieldId)
    return { ...data, _control: control }
  }

  protected async doExecute (data: StopFieldContext): Promise<StopFieldResult> {
    const stopTime = await data._control.stop()
    return { ...data, stopTime }
  }
}
