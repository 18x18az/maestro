import { Injectable } from '@nestjs/common'
import { PublishService } from 'src/utils/publish/publish.service'
import { Payload, Publisher } from '@alecmmiller/nestjs-client-generator'
import { SkillsScore } from './skillsScore.interface'

enum RUN_TYPE {
  PROGRAMMING = 'programming',
  DRIVER = 'driver'
}

function makeTopic (isFinal: boolean, team: string, type: RUN_TYPE, run: number): string {
  return `team/${team}/skills/${type}/${run}/${isFinal ? 'final' : 'working'}`
}

@Injectable()
export class SkillsScorePublisher {
  constructor (private readonly publisher: PublishService) {}

  @Publisher('team/:team/skills/:type/:run/working')
  async publishWorkingScore (team: string, type: RUN_TYPE, run: number, @Payload({}) score: SkillsScore): Promise<void> {
    await this.publisher.broadcast(makeTopic(false, team, type, run), score)
  }

  @Publisher('team/:team/skills/:type/:run/final')
  async publishFinalScore (team: string, type: RUN_TYPE, run: number, @Payload({}) score: SkillsScore): Promise<void> {
    await this.publisher.broadcast(makeTopic(true, team, type, run), score)
  }
}
