import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { MatchRepo } from './match.repo'
import { BlockStatus, SittingStatus } from './match.interface'
import { StageService } from '../../stage'
import { QueueSittingEvent } from '../competition-field/queue-sitting.event'
import { UnqueueSittingEvent } from '../competition-field/unqueue-sitting.event'

@Injectable()
export class MatchInternal {
  private readonly logger = new Logger(MatchInternal.name)

  constructor (
    private readonly repo: MatchRepo,
    private readonly stage: StageService,
    private readonly queuedEvent: QueueSittingEvent,
    private readonly unqueuedEvent: UnqueueSittingEvent
  ) {}

  onModuleInit (): void {
    this.queuedEvent.registerAfter(async (data) => {
      await this.updateSittingStatus(data.sittingId, SittingStatus.QUEUED)
    })

    this.unqueuedEvent.registerAfter(async (data) => {
      await this.updateSittingStatus(data.sittingId, SittingStatus.NOT_STARTED)
    })
  }

  async updateSittingStatus (sitting: number, status: SittingStatus): Promise<void> {
    await this.repo.updateSittingStatus(sitting, status)
  }

  async startNextBlock (): Promise<void> {
    const currentBlock = await this.repo.getCurrentBlock()

    if (currentBlock !== null) {
      throw new BadRequestException('Block already in progress')
    }

    const block = await this.repo.getNextBlock()

    if (block === null) {
      throw new BadRequestException('No next block to start')
    }

    await this.repo.markBlockStatus(block.id, BlockStatus.IN_PROGRESS)
  }
}
