import { MatchResolution, QualMatchBlockBroadcast } from '@/features/initial'
import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { QueueingPublisher } from './queueing.publisher'
import { FieldInfoBroadcast } from '@/features/devices/field'
import { QueuedMatch } from './queueing.interface'

@Injectable()
export class QueueingService {
  private readonly logger = new Logger(QueueingService.name)
  currentBlock: QualMatchBlockBroadcast | null = null
  queuedMatches: QueuedMatch[] = []
  allBlocks: QualMatchBlockBroadcast[] = []
  fields: FieldInfoBroadcast[] = []

  constructor (private readonly publisher: QueueingPublisher) {}

  async handleQualBlockUpdate (blocks: QualMatchBlockBroadcast[]): Promise<void> {
    this.allBlocks = blocks

    if (this.currentBlock === null) {
      this.logger.log('No block currently running')
      for (const block of blocks) {
        // See if the first match has been at least queued
        const firstMatch = block.matches[0]
        if (firstMatch.resolution === MatchResolution.NOT_STARTED) continue

        // See if any of the last n matches have not been resolved
        const numFields = this.fields.length
        const lastNMatches = block.matches.slice(-numFields)
        if (lastNMatches.find(match => match.resolution !== MatchResolution.RESOLVED) === undefined) continue

        // If we get here, we have an incomplete block
        this.currentBlock = block
        this.logger.log('Resuming incomplete block')
        await this.handleQueueingUpdate()
        return
      }
    }

    await this.publishBlock()
  }

  async handleFieldInfo (fields: FieldInfoBroadcast[]): Promise<void> {
    this.fields = fields.filter((field) => field.isCompetition)
  }

  private async publishBlock (): Promise<void> {
    await this.publisher.publishBlock(this.currentBlock as QualMatchBlockBroadcast)
  }

  private async handleQueueingUpdate (): Promise<void> {
    const numSlots = this.fields.length * 2

    if (this.currentBlock === null) throw new Error('Current block is null')

    // get first n matches from queue
    const matches = this.currentBlock.matches.slice(0, numSlots).map((match) => {
      const fieldName = this.fields.find((field) => field.fieldId === match.field)?.name
      if (fieldName === undefined) throw new Error('Field name is undefined')
      if (this.currentBlock === null) throw new Error('Current block is null')

      const blockId = this.currentBlock.id

      return { ...match, fieldName, blockId }
    })
    await this.publisher.publishQueuedMatches(matches)
  }

  async startNextBlock (): Promise<void> {
    if (this.currentBlock !== null) {
      throw new BadRequestException('Cannot start next block while one is already running')
    }

    this.logger.log('Starting next block')
    this.currentBlock = this.allBlocks[0]
    await this.handleQueueingUpdate()
    await this.publishBlock()
  }
}
