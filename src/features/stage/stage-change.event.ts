import { Injectable } from '@nestjs/common'
import { EventService } from '../../utils/classes/event-service'
import { EventStage } from './stage.interface'
import { StageInternal } from './stage.internal'

export interface StageChangePayload {
  stage: EventStage
}

@Injectable()
export class StageChangeEvent extends EventService<StageChangePayload, StageChangePayload, StageChangePayload> {
  constructor (private readonly service: StageInternal) { super() }

  protected async doExecute (data: StageChangePayload): Promise<StageChangePayload> {
    await this.service.setStage(data.stage)

    return data
  }
}
