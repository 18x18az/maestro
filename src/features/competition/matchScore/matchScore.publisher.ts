import { Injectable } from '@nestjs/common'
import { PublishService } from 'src/utils/publish/publish.service'
import { MatchScore } from './matchScore.interface'
import { Payload, Publisher } from '@alecmmiller/nestjs-client-generator'

function makeTopic (isFinal: boolean, round: string, match: string): string {
  return `round/${round}/match/${match}/score${isFinal ? '/final' : '/working'}`
}

@Injectable()
export class MatchScorePublisher {
  constructor (private readonly publisher: PublishService) {}

  @Publisher('round/:round/match/:match/score/working')
  async publishWorkingScore (round: string, match: string, @Payload({}) score: MatchScore): Promise<void> {
    await this.publisher.broadcast(makeTopic(false, round, match), score)
  }

  @Publisher('round/:round/match/:match/score/final')
  async publishFinalScore (round: string, match: string, @Payload({}) score: MatchScore): Promise<void> {
    await this.publisher.broadcast(makeTopic(true, round, match), score)
  }
}
