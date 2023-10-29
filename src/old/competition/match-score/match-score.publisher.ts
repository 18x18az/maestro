import { Injectable } from '@nestjs/common'
import { PublishService } from '@/old_utils/publish/publish.service'
import { Payload, Publisher } from '@alecmmiller/nestjs-client-generator'
import { PublishedQualMatchScore, PublishedElimMatchScore } from '.'
import { MATCH_ROUND, makeTopic } from './local.dto'

@Injectable()
export class MatchScorePublisher {
  constructor (private readonly publisher: PublishService) {}

  @Publisher('match/qual/:matchId/score/working')
  async publishQualWorkingScore (@Payload({}) score: PublishedQualMatchScore): Promise<void> {
    const matchId = parseInt(score.id)
    await this.publisher.broadcast(makeTopic(matchId, MATCH_ROUND.QUALIFICATION, false), score)
  }

  @Publisher('match/qual/:matchId/score/saved')
  async publishQualSavedScore (@Payload({}) score: PublishedQualMatchScore): Promise<void> {
    const matchId = parseInt(score.id)
    await this.publisher.broadcast(makeTopic(matchId, MATCH_ROUND.QUALIFICATION, true), score)
  }

  @Publisher('match/elim/:matchId/score/working')
  async publishElimWorkingScore (@Payload({}) score: PublishedElimMatchScore): Promise<void> {
    const matchId = parseInt(score.id)
    await this.publisher.broadcast(makeTopic(matchId, MATCH_ROUND.ELIMINATION, false), score)
  }

  @Publisher('match/elim/:matchId/score/saved')
  async publishElimSavedScore (@Payload({}) score: PublishedElimMatchScore): Promise<void> {
    const matchId = parseInt(score.id)
    await this.publisher.broadcast(makeTopic(matchId, MATCH_ROUND.ELIMINATION, true), score)
  }
}
