import { PublishService } from '@/utils/publish/publish.service'
import { Injectable } from '@nestjs/common'
import { QualBlock, STAGE, Team } from './simple.interface'

@Injectable()
export class SimplePublisher {
  constructor (private readonly publisher: PublishService) {}

  async publishStage (stage: STAGE): Promise<void> {
    await this.publisher.broadcast('stage', stage)
  }

  async publishQuals (blocks: QualBlock[]): Promise<void> {
    await this.publisher.broadcast('quals', blocks)
  }

  async publishTeams (teams: Team[]): Promise<void> {
    await this.publisher.broadcast('teams', teams)
  }
}
