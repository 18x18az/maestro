import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { MatchRepo } from './match.repo'
import { BlockStatus, SittingStatus } from './match.interface'
import { QueueSittingEvent } from '../competition-field/queue-sitting.event'
import { UnqueueSittingEvent } from '../competition-field/unqueue-sitting.event'
import { MatchResultEvent } from './match-result.event'
import { SittingScoredEvent } from './sitting-scored.event'
import { ReplayMatchEvent } from '../competition-field/replay-match.event'
import { BlockEntity } from './block.entity'

@Injectable()
export class MatchInternal {
  private readonly logger = new Logger(MatchInternal.name)

  constructor (
    private readonly repo: MatchRepo,
    private readonly queuedEvent: QueueSittingEvent,
    private readonly unqueuedEvent: UnqueueSittingEvent,
    private readonly matchResultEvent: MatchResultEvent,
    private readonly sittingScoredEvent: SittingScoredEvent,
    private readonly replayEvent: ReplayMatchEvent
  ) {}

  onModuleInit (): void {
    this.queuedEvent.registerAfter(async (data) => {
      await this.updateSittingStatus(data.sittingId, SittingStatus.QUEUED)
    })

    this.unqueuedEvent.registerAfter(async (data) => {
      await this.updateSittingStatus(data.sittingId, SittingStatus.NOT_STARTED)
    })

    this.matchResultEvent.registerAfter(async (data) => {
      const pendingSitting = await this.repo.getPendingSitting(data.matchId)

      if (pendingSitting === null) {
        this.logger.warn(`No pending sitting found for match ID ${data.matchId}`)
        return
      }

      await this.sittingScoredEvent.execute({ sitting: pendingSitting })
    })

    this.replayEvent.registerAfter(async (data) => {
      await this.repo.replaySitting(data.sittingId)
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

  async concludeBlock (): Promise<BlockEntity> {
    const currentBlock = await this.repo.getCurrentBlock()

    if (currentBlock === null) {
      throw new BadRequestException('No block in progress')
    }

    await this.repo.markBlockStatus(currentBlock.id, BlockStatus.FINISHED)
    return currentBlock
  }
}
