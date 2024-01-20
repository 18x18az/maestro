import { Injectable } from '@nestjs/common'
import { EventService } from '../../../utils/classes/event-service'
import { MatchRepo } from './match.repo'
import { SittingStatus } from './match.interface'

interface SittingCompletePayload {
  sitting: number
}

@Injectable()
export class SittingCompleteEvent extends EventService<SittingCompletePayload, SittingCompletePayload, SittingCompletePayload> {
  constructor (private readonly repo: MatchRepo) { super() }
  protected async doExecute (data: SittingCompletePayload): Promise<SittingCompletePayload> {
    await this.repo.updateSittingStatus(data.sitting, SittingStatus.COMPLETE)
    return data
  }
}
