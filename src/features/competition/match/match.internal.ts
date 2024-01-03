import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { MatchRepo } from './match.repo'
import { BlockStatus, Match, SittingStatus } from './match.interface'
import { ElimsMatch } from '@/utils'
import { EventStage, StageService } from '../../stage'

@Injectable()
export class MatchInternal {
  private readonly logger = new Logger(MatchInternal.name)

  constructor (
    private readonly repo: MatchRepo,
    private readonly stage: StageService
  ) {}

  async onApplicationBootstrap (): Promise<void> {
    const stage = await this.stage.getStage()

    if (stage === EventStage.QUALIFICATIONS) {
      await this.loadQualState()
    } else if (stage === EventStage.ELIMS) {
      await this.loadElimsState()
    }
  }

  async updateSittingStatus (match: number, status: SittingStatus): Promise<void> {
    await this.repo.updateSittingStatus(match, status)
  }

  private async publishUnqueuedQuals (): Promise<void> {
    // const block = await this.repo.getCurrentBlock()
    // if (block === null) {
    //   return
    // }
    // const matches = await this.repo.getUnqueuedQuals(true)
    // this.logger.log(`Publishing ${matches.length} unqueued matches`)
  }

  async loadQualState (): Promise<void> {
    // const matches = await this.repo.getQuals()
    // this.logger.log(`Loaded ${matches.length} matches`)
  }

  async loadElimsState (): Promise<void> {
    // const matches = await this.repo.getElims()
    // this.logger.log(`Loaded ${matches.length} matches`)

    // const block = await this.repo.getCurrentBlock()
    // if (block === null) {
    //   this.logger.log('No block in process')
    // } else {
    //   this.logger.log(`Block ${block.name} in process`)
    // }
  }

  private async publishBlock (): Promise<void> {
    // const block = await this.repo.getCurrentBlock()
    // if (block === null) {
    //   return
    // }

    // await this.publishUnqueuedQuals()
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

  async reconcileQueued (queuedMatches: Match[]): Promise<void> {
    // const storedQueuedMatches = await this.repo.getQueuedMatches()
    // const storedScoringMatches = await this.repo.getScoringMatches()

    // const validMatches = [...storedQueuedMatches, ...storedScoringMatches]

    // for (const validMatch of validMatches) {
    //   const match = queuedMatches.find(match => match.id === validMatch.id)
    //   if (match === undefined) {
    //     this.logger.warn(`Match ${validMatch.id} is queued but not in queue, fixing`)
    //     await this.repo.updateMatchStatus(validMatch.id, MatchStatus.NOT_STARTED)
    //   }
    // }

    // for (const providedMatch of queuedMatches) {
    //   const match = validMatches.find(match => match.id === providedMatch.id)
    //   if (match === undefined) {
    //     this.logger.warn(`Match ${providedMatch.id} is in queue but not queued, fixing`)
    //     await this.repo.updateMatchStatus(providedMatch.id, MatchStatus.QUEUED)
    //   }
    // }

    // await this.publishUnqueuedQuals()
  }

  // async getUnqueuedMatches (): Promise<Match[]> {
  //   return await this.repo.getUnqueuedQuals(true)
  // }

  async removeFieldAssignment (match: number): Promise<void> {
  //   await this.repo.removeFieldAssignment(match)
  //   await this.publishUnqueuedQuals()
  }

  async createElimsBlock (): Promise<number> {
    return await this.repo.createElimsBlock()
  }

  async createElimsMatch (match: ElimsMatch): Promise<void> {
    // const existingMatch = await this.repo.getMatch(match.identifier)

    // if (existingMatch !== null) {
    //   return
    // }

    // this.logger.log(`Creating match ${JSON.stringify(match.identifier)}`)
    // await this.repo.createElimsMatch(match)
  }

  // async getMatch (match: number): Promise<Match | null> {
  //   // return await this.repo.getMatchById(match)
  // }

  // async findByIdent (ident: MatchIdentifier): Promise<Match> {
  //   // return await this.repo.findByIdent(ident)
  // }
}
