import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { MatchRepo } from './match.repo'
import { MatchPublisher } from './match.publisher'
import { EventStage, StageService } from '../stage'
import { Match, MatchStatus } from './match.interface'

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
      await this.loadQualState()
    }
  }

  private async publishUnqueuedQuals (): Promise<void> {
    const matches = await this.repo.getUnqueuedQuals(true)
    this.logger.log(`Publishing ${matches.length} unqueued matches`)
    await this.publisher.publishUnqueuedMatches(matches)
  }

  private async publisNoBlock (): Promise<void> {
    await this.publisher.publishBlock(null)
  }

  async loadQualState (): Promise<void> {
    const matches = await this.repo.getQuals()
    this.logger.log(`Loaded ${matches.length} matches`)
    await this.publisher.publishMatchlist(matches)

    const block = await this.repo.getCurrentBlock()
    if (block === null) {
      this.logger.log('No block in process')
      await this.publisNoBlock()
    } else {
      this.logger.log(`Block ${block.name} in process`)
      await this.publishUnqueuedQuals()
      await this.publishBlock()
    }
  }

  private async publishBlock (): Promise<void> {
    const block = await this.repo.getCurrentBlock()
    if (block === null) {
      throw new BadRequestException('No block in process')
    }

    await this.publisher.publishBlock(block.name)
    await this.publishUnqueuedQuals()
  }

  async startNextBlock (): Promise<void> {
    const block = await this.repo.getCurrentBlock()
    if (block !== null) {
      throw new BadRequestException('Block already in process')
    }

    const nextBlockExists = await this.repo.startNextBlock()

    if (nextBlockExists) {
      await this.publishBlock()
    }
  }

  async updateMatchStatus (match: number, status: MatchStatus): Promise<void> {
    await this.repo.updateMatchStatus(match, status)
    await this.publishUnqueuedQuals()
  }

  async reconcileQueued (queuedMatches: Match[]): Promise<void> {
    const storedQueuedMatches = await this.repo.getQueuedMatches()
    const storedScoringMatches = await this.repo.getScoringMatches()

    const validMatches = [...storedQueuedMatches, ...storedScoringMatches]

    for (const validMatch of validMatches) {
      const match = queuedMatches.find(match => match.id === validMatch.id)
      if (match === undefined) {
        this.logger.warn(`Match ${validMatch.id} is queued but not in queue, fixing`)
        await this.repo.updateMatchStatus(validMatch.id, MatchStatus.NOT_STARTED)
      }
    }

    for (const providedMatch of queuedMatches) {
      const match = validMatches.find(match => match.id === providedMatch.id)
      if (match === undefined) {
        this.logger.warn(`Match ${providedMatch.id} is in queue but not queued, fixing`)
        await this.repo.updateMatchStatus(providedMatch.id, MatchStatus.QUEUED)
      }
    }

    await this.publishUnqueuedQuals()
  }

  async getUnqueuedMatches (): Promise<Match[]> {
    return await this.repo.getUnqueuedQuals(false)
  }

  async removeFieldAssignment (match: number): Promise<void> {
    await this.repo.removeFieldAssignment(match)
    await this.publishUnqueuedQuals()
  }
}
