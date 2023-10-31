
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

  async onApplicationBootstrap (): Promise<void> {
    const loaded = await this.storage.getEphemeral(STORAGE_KEY, INITIAL_STAGE)
    // check if loaded is a valid stage
    if (loaded in EventStage) {
      this.logger.log(`Loaded in stage ${loaded}`)
      this.currentStage = loaded as EventStage
    } else {
      this.logger.warn(`Invalid stage ${loaded} loaded from storage, defaulting to WAITING_FOR_TEAMS`)
      this.currentStage = INITIAL_STAGE
    }
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
}
