import { Injectable } from '@nestjs/common'
import { EventService } from '../../utils/classes/event-service'
import { EventStage } from './stage.interface'
import { StageInternal } from './stage.internal'

@Injectable()
export class EventResetEvent extends EventService<void, void, void> {
  constructor (private readonly service: StageInternal) { super() }

  protected async doExecute (): Promise<void> {
    await this.service.setStage(EventStage.WAITING_FOR_TEAMS)
  }
}
