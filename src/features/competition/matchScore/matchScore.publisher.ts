import { Injectable } from '@nestjs/common'
import { PublishService } from 'utils/publish/publish.service'
import { ElimMatchScoreWithDetails, MATCH_ROUND, MatchScoreFromPrismaWithDetails, MatchScoreWithDetails, QualMatchScoreWithDetails } from './matchScore.interface'
import { Payload, Publisher } from '@alecmmiller/nestjs-client-generator'

function makeTopic (matchId: number, round: MATCH_ROUND, isFinal: boolean): string {
  return `match/${round}/${matchId}/score${isFinal ? '/saved' : '/working'}`
}

@Injectable()
export class MatchScorePublisher {
  constructor (private readonly publisher: PublishService) {}

  @Publisher('match/qual/:matchId/score/working')
  async publishQualWorkingScore (matchId: number, @Payload({}) score: QualMatchScoreWithDetails): Promise<void> {
    await this.publisher.broadcast(makeTopic(matchId, MATCH_ROUND.QUALIFICATION, false), score)
  }

  @Publisher('match/elim/:matchId/score/working')
  async publishElimWorkingScore (matchId: number, @Payload({}) score: ElimMatchScoreWithDetails): Promise<void> {
    await this.publisher.broadcast(makeTopic(matchId, MATCH_ROUND.ELIMINATION, false), score)
  }

  async publishWorkingScore (matchId: number, round: MATCH_ROUND, score: MatchScoreWithDetails): Promise<void> {
    if (round === MATCH_ROUND.QUALIFICATION) {
      await this.publishQualWorkingScore(matchId, score as QualMatchScoreWithDetails)
    } else await this.publishElimWorkingScore(matchId, score as ElimMatchScoreWithDetails)
  }

  @Publisher('match/:round/:matchId/score/saved')
  async publishFinalScore (matchId: number, round: MATCH_ROUND, @Payload({}) score: MatchScoreFromPrismaWithDetails): Promise<void> {
    await this.publisher.broadcast(makeTopic(matchId, round, true), score)
  }
}
