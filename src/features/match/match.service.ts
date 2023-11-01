import { Injectable, Logger } from '@nestjs/common'
import { MatchRepo } from './match.repo'
import { MatchInternal } from './match.internal'
import { ReplayStatus } from './match.interface'

@Injectable()
export class MatchService {
  private readonly logger = new Logger(MatchService.name)

  constructor (
    private readonly repo: MatchRepo,
    private readonly service: MatchInternal
  ) {}

  async isInBlock (): Promise<boolean> {
    const currentBlock = await this.repo.getCurrentBlock()

    return currentBlock !== null
  }

  async cueNextBlock (): Promise<boolean> {
    this.logger.log('Cueing next block')
    const nextBlock = await this.repo.cueNextBlock()

    if (nextBlock === null) {
      this.logger.log('No more blocks to cue')
      return false
    }

    this.logger.log(`Cued block ${nextBlock.id}`)
    await this.service.updateCurrentBlock(nextBlock)
    return true
  }

  async markOnDeck (replayId: number): Promise<void> {
    this.logger.log(`Marking replay ${replayId} as on deck`)
    await this.repo.setStatus(replayId, ReplayStatus.ON_DECK)
    await this.service.refreshCurrentBlock()
  }

  async markPlayed (replayId: number): Promise<void> {
    this.logger.log(`Marking replay ${replayId} as played`)
    await this.repo.setStatus(replayId, ReplayStatus.AWAITING_SCORES)
    await this.service.refreshCurrentBlock()
  }

  async markScored (replayId: number): Promise<void> {
    this.logger.log(`Marking replay ${replayId} as scored`)
    await this.repo.setStatus(replayId, ReplayStatus.RESOLVED)
    await this.service.refreshCurrentBlock()
  }
}
