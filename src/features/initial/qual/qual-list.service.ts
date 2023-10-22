import { Injectable, Logger } from '@nestjs/common'
import { QualScheduleBlockUpload, QualUpload } from './qual-list.interface'
import { QualSchedulePublisher } from './qual-list.publisher'
import { QualListRepo } from './qual-list.repo'
import { EVENT_STAGE } from '@/features/stage'

@Injectable()
export class QualScheduleService {
  constructor (private readonly repo: QualListRepo, private readonly publisher: QualSchedulePublisher) { }

  async onApplicationBootstrap (): Promise<void> {
    const existing = await this.repo.hydrateQuals()

    if (!existing) return

    this.logger.log('Qual schedule loaded')
    await this.broadcastQuals()
  }

  private readonly logger = new Logger(QualScheduleService.name)

  private async storeMatchBlock (block: QualScheduleBlockUpload): Promise<void> {
    const blockId = await this.repo.createBlock(block)

    for (const match of block.matches) {
      const matchId = await this.repo.createMatch(match)
      await this.repo.appendMatchToBlock(blockId, matchId)
    }
  }

  async uploadQualSchedule (schedule: QualUpload): Promise<void> {
    this.logger.log('Received qual schedule')

    for (const block of schedule.blocks) {
      await this.storeMatchBlock(block)
    }

    await this.broadcastQuals()
  }

  async broadcastQuals (): Promise<void> {
    const quals = this.repo.getQuals()
    const blocks = this.repo.getBlocks()
    this.logger.log('Broadcasting qual schedule')
    await this.publisher.publishQuals(quals)
    await this.publisher.publishBlocks(blocks)
  }

  async handleStageChange (stage: string): Promise<void> {
    if (stage === EVENT_STAGE.SETUP) {
      await this.repo.reset()
      await this.broadcastQuals()
    }
  }
}
