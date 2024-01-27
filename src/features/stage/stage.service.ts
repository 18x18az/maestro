import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { EventStage } from './stage.interface'
import { StorageService } from '../../utils/storage/storage.service'
import { EventResetEvent } from './event-reset.event'
import { SettingsService } from '../../utils/settings/settings.service'
import { TeamListUpdateEvent } from '../team/team-list-update.event'

const DEFAULT_STAGE = EventStage.TEARDOWN

@Injectable()
export class StageService {
  private readonly logger: Logger = new Logger(StageService.name)
  constructor (
    private readonly storage: StorageService,
    private readonly resetEvent: EventResetEvent,
    private readonly settings: SettingsService,
    private readonly teamListUpdateEvent: TeamListUpdateEvent
  ) {
    this.teamListUpdateEvent.registerOnComplete(this.handleTeamListUpdate.bind(this))
  }

  async handleTeamListUpdate (): Promise<void> {
    if (await this.getStage() !== EventStage.WAITING_FOR_TEAMS) return

    this.logger.log('Teams loaded, moving to checkin stage')
    await this.setStage(EventStage.CHECKIN)
  }

  async onModuleInit (): Promise<void> {
    const stage = await this.getStage()

    if (stage === EventStage.TEARDOWN) {
      this.logger.log('Event loaded in teardown stage, resetting to setup')
      await this.resetEvent.execute()
    }
  }

  async setStage (stage: EventStage): Promise<void> {
    await this.storage.setEphemeral('stage', stage)
  }

  async getStage (): Promise<EventStage> {
    return await this.storage.getEphemeral('stage', DEFAULT_STAGE) as EventStage
  }

  async reset (): Promise<void> {
    if (!this.settings.isTestMode()) throw new BadRequestException('Cannot reset event outside of test mode')

    await this.resetEvent.execute()
  }
}
