import { Injectable } from '@nestjs/common'
import { EventService } from '../../utils/classes/event-service'
import { RankingCache } from './ranking.cache'

interface RankingsUpdatePayload {
  rankings: string[]
}

@Injectable()
export class RankingsUpdateEvent extends EventService<RankingsUpdatePayload, RankingsUpdatePayload, RankingsUpdatePayload> {
  constructor (
    private readonly cache: RankingCache
  ) { super() }

  protected async doExecute (data: RankingsUpdatePayload): Promise<RankingsUpdatePayload> {
    return data
  }
}
