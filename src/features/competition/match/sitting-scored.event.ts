import { Injectable } from '@nestjs/common'
import { EventService } from '../../../utils/classes/event-service'
import { SittingCompleteEvent } from './sitting-complete.event'

interface SittingScoredPayload {
  sitting: number
}

@Injectable()
export class SittingScoredEvent extends EventService<SittingScoredPayload, SittingScoredPayload, SittingScoredPayload> {
  constructor (private readonly sittingComplete: SittingCompleteEvent) { super() }
  protected async doExecute (data: SittingScoredPayload): Promise<SittingScoredPayload> {
    await this.sittingComplete.execute(data)
    return data
  }
}
