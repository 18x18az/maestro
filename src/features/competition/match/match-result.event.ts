import { Injectable } from '@nestjs/common'
import { EventService } from '../../../utils/classes/event-service'
import { MatchRepo } from './match.repo'
import { MatchIdentifier } from '../../../utils/tm/tm.interface'

interface MatchResultPayload {
  identifier: MatchIdentifier
  redScore: number
  blueScore: number
}

export interface MatchResultContext extends MatchResultPayload {
  matchId: number
}

@Injectable()
export class MatchResultEvent extends EventService<MatchResultPayload, MatchResultContext, MatchResultContext> {
  constructor (private readonly repo: MatchRepo) { super() }

  protected async getContext (data: MatchResultPayload): Promise<MatchResultContext> {
    const matchId = await this.repo.getMatchId(data.identifier)

    return {
      ...data,
      matchId
    }
  }

  protected async doExecute (data: MatchResultContext): Promise<MatchResultContext> {
    this.logger.log(`Updating match ${data.matchId} with score ${data.redScore}-${data.blueScore}`)
    await this.repo.updateMatchScore(data.matchId, data.redScore, data.blueScore)
    return data
  }
}
