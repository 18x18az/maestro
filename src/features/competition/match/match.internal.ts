import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { MatchRepo } from './match.repo'
import { MatchPublisher } from './match.publisher'
import { Match, MatchIdentifier, MatchStatus } from './match.interface'
import { ElimsMatch } from '@/utils'
import { EventStage, StageService } from '../../stage'

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
    } else if (stage === EventStage.ELIMS) {
      await this.loadElimsState()
    }
  }

  private async publishUnqueuedQuals (): Promise<void> {
    const block = await this.repo.getCurrentBlock()
    if (block === null) {
      await this.publisher.publishUnqueuedMatches([])
      return
    }
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

  async loadElimsState (): Promise<void> {
    const matches = await this.repo.getElims()
    this.logger.log(`Loaded ${matches.length} matches`)
    await this.publisher.publishMatchlist(matches)

    const block = await this.repo.getCurrentBlock()
    if (block === null) {
      this.logger.log('No block in process')
      await this.publisNoBlock()
    } else {
      this.logger.log(`Block ${block.name} in process`)
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
      this.logger.log(`Ending block ${block.name}`)
      await this.repo.endCurrentBlock()
    }

    const nextBlockExists = await this.repo.startNextBlock()

    if (nextBlockExists) {
      this.logger.log('Next block exists, publishing')
      await this.publishBlock()
    } else {
      this.logger.log('No more blocks, advancing stage')
      await this.stage.advanceStage()
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
    return await this.repo.getUnqueuedQuals(true)
  }

  async removeFieldAssignment (match: number): Promise<void> {
    await this.repo.removeFieldAssignment(match)
    await this.publishUnqueuedQuals()
  }

  async createElimsBlock (): Promise<number> {
    return await this.repo.createElimsBlock()
  }

  async createElimsMatch (match: ElimsMatch): Promise<void> {
    const existingMatch = await this.repo.getMatch(match.identifier)

    if (existingMatch !== null) {
      return
    }

    this.logger.log(`Creating match ${JSON.stringify(match.identifier)}`)
    await this.repo.createElimsMatch(match)
  }

  async getMatch (match: number): Promise<Match | null> {
    return await this.repo.getMatchById(match)
  }

  async findByIdent (ident: MatchIdentifier): Promise<Match> {
    return await this.repo.findByIdent(ident)
  }
}
