import { Injectable, Logger } from '@nestjs/common'
import { MatchRepo } from './match.repo'
import { MatchPublisher } from './match.publisher'
import { EventStage, StageService } from '../stage'

@Injectable()
export class MatchInternal {
  private readonly logger = new Logger(MatchInternal.name)

  constructor (
    private readonly repo: MatchRepo,
    private readonly publisher: MatchPublisher,
    private readonly stage: StageService
  ) {}

  async onApplicationBootstrap (): Promise<void> {
    const stage = this.stage.getStage()

    if (stage === EventStage.QUALIFICATIONS) {
      this.logger.log('Publishing stored quals')
      await this.publishAllQuals()
    }
  }

  async publishAllQuals (): Promise<void> {
    this.logger.log('Publishing all quals')
    const quals = await this.repo.getQuals()
    await this.publisher.publishQuals(quals)
    const blocks = await this.repo.getQualBlocks()
    await this.publisher.publishQualBlocks(blocks)
  }

  async handleStageChange (stage: EventStage): Promise<void> {
    if (stage === EventStage.WAITING_FOR_TEAMS) {
      this.logger.log('Resetting matches')
      await this.repo.reset()
    }
  }
}
