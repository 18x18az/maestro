import { FieldControlModel } from './field-control.model'

export interface StopFieldPayload {
  fieldId: number
}

export interface StopFieldContext extends StopFieldPayload {
  _control: FieldControlModel
}

export interface StopFieldResult extends StopFieldContext {
  stopTime: number
}

// export class StopFieldEvent extends EventService<StopFieldPayload, StopFieldContext, StopFieldResult> {
//   constructor (private readonly service: FieldControlService) { super() }

//   protected async getContext (data: StopFieldPayload): Promise<StopFieldContext> {
//     const control = await this.service.getOrCreateField(data.fieldId)
//     return { ...data, _control: control }
//   }

//   protected async doExecute (data: StopFieldContext): Promise<StopFieldResult> {
//     const stopTime = await data._control.stop()
//     return { ...data, stopTime }
//   }
// }
