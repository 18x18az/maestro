
import { Injectable, Logger } from '@nestjs/common'
import { EventStage } from './stage.interface'
import { StorageService, TeamInformation } from '@/utils'
import { StagePublisher } from './stage.publisher'
import { StageRepo } from './stage.repo'

const STORAGE_KEY = 'stage'

const INITIAL_STAGE = EventStage.WAITING_FOR_TEAMS

@Injectable()
export class StageInternal {
  private readonly logger = new Logger(StageInternal.name)

  currentStage: EventStage

  constructor (
    private readonly storage: StorageService,
    private readonly publisher: StagePublisher,
    private readonly repo: StageRepo
  ) { }

  async onModuleInit (): Promise<void> {
    this.currentStage = await this.storage.getEphemeral(STORAGE_KEY, INITIAL_STAGE) as EventStage
    this.logger.log(`Stage initialized to ${this.currentStage}`)
  }

  async onApplicationBootstrap (): Promise<void> {
    await this.publisher.publishStage(this.currentStage)
  }

  getStage (): EventStage {
    return this.currentStage
  }

  private async onReset (): Promise<void> {
    this.logger.log('Resetting stage')
    await this.storage.clearEphemeral()
    await this.repo.reset()
  }

  async setStage (stage: EventStage): Promise<void> {
    this.logger.log(`Stage changed to ${stage}`)
    if (stage === EventStage.WAITING_FOR_TEAMS) {
      await this.onReset()
    }
    this.currentStage = stage
    await this.storage.setEphemeral(STORAGE_KEY, stage)
    await this.publisher.publishStage(stage)
  }

  async receivedTeams (teams: TeamInformation[]): Promise<void> {
    if (teams.length > 0 && this.currentStage === EventStage.WAITING_FOR_TEAMS) {
      await this.setStage(EventStage.CHECKIN)
    }
  }

  async receivedMatches (): Promise<void> {
    if (this.currentStage === EventStage.CHECKIN) {
      this.logger.log('Received qual match list, advancing to qualifications')
      await this.setStage(EventStage.QUALIFICATIONS)
    } else if (this.currentStage === EventStage.ALLIANCE_SELECTION) {
      this.logger.log('Received elim matches, advancing to elims')
      await this.setStage(EventStage.ELIMS)
    }
  }

  async reset (): Promise<void> {
    await this.setStage(EventStage.WAITING_FOR_TEAMS)
  }

  async advanceStage (): Promise<void> {
    if (this.currentStage === EventStage.QUALIFICATIONS) {
      this.logger.log('Advancing to alliance selection')
      await this.setStage(EventStage.ALLIANCE_SELECTION)
    } else if (this.currentStage === EventStage.ALLIANCE_SELECTION) {
      this.logger.log('Advancing to elims')
      await this.setStage(EventStage.ELIMS)
    }
  }
}