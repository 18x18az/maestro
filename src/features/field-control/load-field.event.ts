import { Injectable } from '@nestjs/common'
import { EventService } from '../../utils/classes/event-service'
import { CONTROL_MODE } from './field-control.interface'
import { FieldControlModel } from './field-control.model'
import { FieldControlService } from './field-control.service'

interface LoadFieldPayload {
  fieldId: number
  mode: CONTROL_MODE
  duration: number
}

interface LoadFieldContext extends LoadFieldPayload {
  _control: FieldControlModel
}

@Injectable()
export class LoadFieldEvent extends EventService<LoadFieldPayload, LoadFieldContext, LoadFieldContext> {
  constructor (private readonly service: FieldControlService) {
    super()
  }

  protected async getContext (data: LoadFieldPayload): Promise<LoadFieldContext> {
    const model = await this.service.getOrCreateField(data.fieldId)
    return { ...data, _control: model }
  }

  protected async doExecute (data: LoadFieldContext): Promise<LoadFieldContext> {
    await data._control.load(data.mode, data.duration)
    return data
  }
}
