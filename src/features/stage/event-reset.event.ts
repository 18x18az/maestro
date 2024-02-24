import { Injectable } from '@nestjs/common'
import { EventService } from '../../utils/classes/event-service'
import { EventStage } from './stage.interface'
import { StageChangeEvent } from './stage-change.event'

@Injectable()
export class EventResetEvent extends EventService<void, void, void> {
  constructor (private readonly stageChangeEvent: StageChangeEvent) { super() }

  protected async doExecute (): Promise<void> {
    await this.stageChangeEvent.execute({ stage: EventStage.WAITING_FOR_TEAMS })
  }
}
