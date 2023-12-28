import { Injectable } from '@nestjs/common'
import { StorageService } from '../../utils'
import { EventStage } from './stage.interface'

@Injectable()
export class StageInternal {
  constructor (private readonly storage: StorageService) { }

  async setStage (stage: EventStage): Promise<void> {
    await this.storage.setEphemeral('stage', stage)
  }

  async getStage (): Promise<EventStage> {
    return await this.storage.getEphemeral('stage', EventStage.TEARDOWN) as EventStage
  }
}
