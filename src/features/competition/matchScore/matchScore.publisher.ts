import { Injectable } from '@nestjs/common'
import { PublishService } from 'src/utils/publish/publish.service'
import { MATCH_ROUND, MatchScoreInMemory, MatchScoreInPrisma } from './matchScore.interface'
import { Payload, Publisher } from '@alecmmiller/nestjs-client-generator'

function makeTopic (matchId: number, round: MATCH_ROUND, isFinal: boolean): string {
  return `match/${round}/${matchId}/score${isFinal ? '/saved' : '/working'}`
}

@Injectable()
export class MatchScorePublisher {
  constructor (private readonly publisher: PublishService) {}

  @Publisher('match/:round/:matchId/score/working')
  async publishWorkingScore (matchId: number, round: MATCH_ROUND, @Payload({}) score: MatchScoreInMemory): Promise<void> {
    await this.publisher.broadcast(makeTopic(matchId, round, false), score)
  }

  @Publisher('match/:round/:matchId/score/saved')
  async publishFinalScore (matchId: number, round: MATCH_ROUND, @Payload({}) score: MatchScoreInPrisma): Promise<void> {
    await this.publisher.broadcast(makeTopic(matchId, round, true), score)
  }
}
