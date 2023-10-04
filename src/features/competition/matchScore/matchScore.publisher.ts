import { Injectable } from '@nestjs/common'
import { PublishService } from 'src/utils/publish/publish.service'
import { MatchScoreInMemory, MatchScoreInPrisma } from './matchScore.interface'
import { Payload, Publisher } from '@alecmmiller/nestjs-client-generator'

function makeTopic (isFinal: boolean, matchId: number): string {
  return `match/${matchId}/score${isFinal ? '/final' : '/working'}`
}

@Injectable()
export class MatchScorePublisher {
  constructor (private readonly publisher: PublishService) {}

  @Publisher('match/:matchId/score/working')
  async publishWorkingScore (matchId: number, @Payload({}) score: MatchScoreInMemory): Promise<void> {
    await this.publisher.broadcast(makeTopic(false, matchId), score)
  }

  @Publisher('match/:matchId/score/final')
  async publishFinalScore (matchId: number, @Payload({}) score: MatchScoreInPrisma): Promise<void> {
    await this.publisher.broadcast(makeTopic(true, matchId), score)
  }
}
