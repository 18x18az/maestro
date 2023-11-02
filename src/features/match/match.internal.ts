import { Injectable, Logger } from '@nestjs/common'
import { CreateScheduledMatchDto, MatchRepo } from './match.repo'
import { MatchPublisher } from './match.publisher'
import { EventStage, StageService } from '../stage'
import { MatchBlock, MatchIdentifier, ReplayStatus } from './match.interface'
import { makeMatchName } from '@/utils/string/match-name'
import { FieldService } from '../field'

@Injectable()
export class MatchInternal {
  private readonly logger = new Logger(MatchInternal.name)

  constructor (
    private readonly repo: MatchRepo,
    private readonly publisher: MatchPublisher,
    private readonly stage: StageService,
    private readonly fields: FieldService
  ) {}

  async onApplicationBootstrap (): Promise<void> {
    const stage = this.stage.getStage()

    if (stage === EventStage.QUALIFICATIONS) {
      this.logger.log('Publishing stored quals')
      await this.publishAllQuals()

      const currentBlock = await this.repo.getCurrentBlock()
      if (currentBlock !== null) {
        this.logger.log('Publishing stored in progress block')
        await this.publisher.publishCurrentBlock(currentBlock)
      } else {
        this.logger.log('No stored in progress block')
        await this.publisher.publishCurrentBlock(null)
      }
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

  async updateCurrentBlock (block: MatchBlock | null): Promise<void> {
    await this.publisher.publishCurrentBlock(block)
  }

  async refreshCurrentBlock (): Promise<void> {
    let currentBlock = await this.repo.getCurrentBlock()

    // check if there are any matches in the current block that are not resolved

    if (currentBlock !== null && !currentBlock.matches.some((match) => match.status !== ReplayStatus.RESOLVED)) {
      this.logger.log('Current block is resolved, ending')
      await this.repo.endCurrentBlock()
      currentBlock = null
    }
    await this.publisher.publishCurrentBlock(currentBlock)
  }

  async replayMatch (match: MatchIdentifier): Promise<void> {
    this.logger.log(`Scheduling replay for match ${makeMatchName(match)}`)
    const currentBlock = await this.repo.getCurrentBlock()
    if (currentBlock === null) {
      throw new Error('No current block')
    }
    const lastMatchFieldId = await this.repo.getFieldOfLastMatchOfBlock(currentBlock.id)
    if (lastMatchFieldId === null) {
      throw new Error('No last match field')
    }
    const allFields = await this.fields.getCompetitionFields()
    const indexOfLastMatchField = allFields.findIndex((field) => field.id === lastMatchFieldId)
    const nextFieldIndex = (indexOfLastMatchField + 1) % allFields.length
    const nextField = allFields[nextFieldIndex]

    const associatedMatch = await this.repo.getMatchByIdentifier(match)
    if (associatedMatch === null) {
      throw new Error('No associated match')
    }

    const lastReplay = await this.repo.getLastReplay(associatedMatch.id)

    if (lastReplay === null) {
      throw new Error('No last replay')
    }

    const scheduledMatch: CreateScheduledMatchDto = {
      blockId: currentBlock.id,
      fieldId: nextField.id,
      matchId: associatedMatch.id,
      replay: lastReplay.replay + 1
    }
    await this.repo.setStatus(lastReplay.id, ReplayStatus.RESOLVED)
    await this.repo.createScheduledMatch(scheduledMatch)

    await this.refreshCurrentBlock()
  }
}
