import { QualMatchBlockBroadcast } from '@/features/initial'
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
      return { ...match, fieldName }
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
