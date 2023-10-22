import { Injectable, Logger } from '@nestjs/common'
import { MatchResolution, QualScheduleBlockUpload, QualUpload } from './qual-list.interface'
import { QualSchedulePublisher } from './qual-list.publisher'
import { QualListRepo } from './qual-list.repo'
import { EVENT_STAGE } from '@/features/stage'
import { FieldInfoBroadcast } from '@/features/devices/field'
import { QueuedMatch } from '@/features'

@Injectable()
export class QualScheduleService {
  private fieldsCache: number[] = []

  constructor (private readonly repo: QualListRepo, private readonly publisher: QualSchedulePublisher) { }

  async onApplicationBootstrap (): Promise<void> {
    const existing = await this.repo.hydrateQuals()

    if (!existing) return

    this.logger.log('Qual schedule loaded')
    await this.broadcastQuals()
  }

  private readonly logger = new Logger(QualScheduleService.name)

  private async storeMatchBlock (block: QualScheduleBlockUpload, fields: number[]): Promise<void> {
    const blockId = await this.repo.createBlock(block)

    for (const [index, match] of block.matches.entries()) {
      const matchId = await this.repo.createMatch(match)
      const fieldIndex = index % fields.length
      const fieldId = fields[fieldIndex]
      await this.repo.appendMatchToBlock(blockId, matchId, fieldId)
    }
  }

  async uploadQualSchedule (schedule: QualUpload): Promise<void> {
    this.logger.log('Received qual schedule')

    if (this.fieldsCache.length === 0) {
      throw new Error('No fields available')
    }

    for (const block of schedule.blocks) {
      await this.storeMatchBlock(block, this.fieldsCache)
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

  async handleGetFields (fields: FieldInfoBroadcast[]): Promise<void> {
    this.fieldsCache = fields.filter(field => field.isCompetition).map(field => field.fieldId)
  }

  async handleQueueingUpdate (queued: QueuedMatch[]): Promise<void> {
    const numFields = this.fieldsCache.length
    const onFieldMatches = queued.slice(0, numFields)

    for (const match of onFieldMatches) {
      if ([MatchResolution.SCORING, MatchResolution.RESOLVED, MatchResolution.ON_DECK, MatchResolution.IN_PROGRESS].includes(match.resolution)) {
        continue
      }
      this.logger.log(`Marking match ${match.number} as ON_DECK`)
      await this.repo.markSittingResolution(match, MatchResolution.ON_DECK)
    }

    const queuedMatches = queued.slice(numFields)
    for (const match of queuedMatches) {
      if (match.resolution === MatchResolution.QUEUED) {
        continue
      }
      this.logger.log(`Marking match ${match.number} as QUEUED`)
      await this.repo.markSittingResolution(match, MatchResolution.QUEUED)
    }

    const blocks = this.repo.getBlocks()
    await this.publisher.publishBlocks(blocks)
  }
}
