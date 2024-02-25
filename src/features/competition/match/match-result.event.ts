import { Injectable } from '@nestjs/common'
import { EventService } from '../../../utils/classes/event-service'

export interface MatchResultPayload {
  matchId: number
}

@Injectable()
export class MatchResultEvent extends EventService<MatchResultPayload, MatchResultPayload, MatchResultPayload> {
  protected async doExecute (data: MatchResultPayload): Promise<MatchResultPayload> {
    return data
  }
}
