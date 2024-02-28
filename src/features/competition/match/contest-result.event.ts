import { Injectable } from '@nestjs/common'
import { EventService } from '../../../utils/classes/event-service'
import { ContestEntity } from './contest.entity'
import { Winner } from './match.interface'

export interface ContestResultPayload {
  contest: ContestEntity
  winner: Winner
}

@Injectable()
export class ContestResultEvent extends EventService<ContestResultPayload, ContestResultPayload, ContestResultPayload> {
  protected async doExecute (data: ContestResultPayload): Promise<ContestResultPayload> {
    return data
  }
}
