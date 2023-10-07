import { Injectable } from '@nestjs/common'
import { PublishService } from 'src/utils/publish/publish.service'
import { ElimMatchScore, MATCH_ROUND, MatchScore, MatchScoreInPrisma, QualMatchScore } from './matchScore.interface'
import { Payload, Publisher } from '@alecmmiller/nestjs-client-generator'

function makeTopic (matchId: number, round: MATCH_ROUND, isFinal: boolean): string {
  return `match/${round}/${matchId}/score${isFinal ? '/saved' : '/working'}`
}

@Injectable()
export class MatchScorePublisher {
  constructor (private readonly publisher: PublishService) {}

  @Publisher('match/qual/:matchId/score/working')
  async publishQualWorkingScore (matchId: number, @Payload({}) score: QualMatchScore): Promise<void> {
    await this.publisher.broadcast(makeTopic(matchId, MATCH_ROUND.QUALIFICATION, false), score)
  }

  @Publisher('match/elim/:matchId/score/working')
  async publishElimWorkingScore (matchId: number, @Payload({}) score: ElimMatchScore): Promise<void> {
    await this.publisher.broadcast(makeTopic(matchId, MATCH_ROUND.ELIMINATION, false), score)
  }

  async publishWorkingScore (matchId: number, round: MATCH_ROUND, score: MatchScore): Promise<void> {
    if (round === MATCH_ROUND.QUALIFICATION) {
      await this.publishQualWorkingScore(matchId, score as QualMatchScore)
    } else await this.publishElimWorkingScore(matchId, score as ElimMatchScore)
  }

  @Publisher('match/:round/:matchId/score/saved')
  async publishFinalScore (matchId: number, round: MATCH_ROUND, @Payload({}) score: MatchScoreInPrisma): Promise<void> {
    await this.publisher.broadcast(makeTopic(matchId, round, true), score)
  }
}
