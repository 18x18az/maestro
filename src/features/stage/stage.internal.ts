
import { Injectable, Logger } from '@nestjs/common'
import { EventStage } from './stage.interface'
import { StorageService, TeamInformation } from '@/utils'
import { StagePublisher } from './stage.publisher'

const STORAGE_KEY = 'stage'

const INITIAL_STAGE = EventStage.WAITING_FOR_TEAMS

@Injectable()
export class StageInternal {
  private readonly logger = new Logger(StageInternal.name)

  currentStage: EventStage

  constructor (
    private readonly storage: StorageService,
    private readonly publisher: StagePublisher
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

  async setStage (stage: EventStage): Promise<void> {
    this.logger.log(`Stage changed to ${stage}`)
    this.currentStage = stage
    await this.storage.setEphemeral(STORAGE_KEY, stage)
    await this.publisher.publishStage(stage)
  }

  async receivedTeams (teams: TeamInformation[]): Promise<void> {
    if (teams.length > 0 && this.currentStage === EventStage.WAITING_FOR_TEAMS) {
      await this.setStage(EventStage.CHECKIN)
    }
  }

  async receivedQuals (): Promise<void> {
    if (this.currentStage === EventStage.CHECKIN) {
      await this.setStage(EventStage.QUALIFICATIONS)
    }
  }

  async reset (): Promise<void> {
    await this.setStage(EventStage.WAITING_FOR_TEAMS)
  }

  async advanceStage (): Promise<void> {
    if (this.currentStage === EventStage.QUALIFICATIONS) {
      this.logger.log('Advancing to alliance selection')
      await this.setStage(EventStage.ALLIANCE_SELECTION)
    }
  }
}
