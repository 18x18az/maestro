import { Injectable, Logger } from '@nestjs/common'
import { StorageService } from '../../utils/storage/storage.service'
import { PublishService } from '../../utils/publish/publish.service'
import { EVENT_STAGE } from './stage.interface'

const EVENT_STAGE_KEY = 'eventStage'

@Injectable()
export class StageService {
  private readonly logger = new Logger(StageService.name)
  constructor (private readonly storage: StorageService, private readonly publisher: PublishService) { }

  async onApplicationBootstrap (): Promise<void> {
    const existing = await this.getStage()

    if (existing === EVENT_STAGE.TEARDOWN) {
      this.logger.log('New event starting')
      await this.setStage(EVENT_STAGE.SETUP)
      return
    }

    this.logger.log(`Event stage loaded at ${existing as string}`)
    await this.broadcastStage(existing)
  }

  async receivedTeams (): Promise<void> {
    if (await this.getStage() === EVENT_STAGE.SETUP) {
      await this.setStage(EVENT_STAGE.CHECKIN)
    }
  }

  async receivedQuals (): Promise<void> {
    if (await this.getStage() === EVENT_STAGE.CHECKIN) {
      await this.setStage(EVENT_STAGE.EVENT)
    }
  }

  private async getStage (): Promise<EVENT_STAGE> {
    return await this.storage.getPersistent(EVENT_STAGE_KEY, EVENT_STAGE.SETUP) as EVENT_STAGE
  }

  async setStage (stage: EVENT_STAGE): Promise<void> {
    this.logger.log(`Event stage set to ${stage as string}`)
    await this.storage.setPersistent(EVENT_STAGE_KEY, stage)
    await this.broadcastStage(stage)
  }

  private async broadcastStage (stage: EVENT_STAGE): Promise<void> {
    await this.publisher.broadcast(EVENT_STAGE_KEY, stage)
  }
}
