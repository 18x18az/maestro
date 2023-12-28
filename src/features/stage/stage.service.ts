import { Injectable } from '@nestjs/common'
import { EventStage } from './stage.interface'
import { StorageService } from '../../utils/storage/storage.service'

@Injectable()
export class StageService {
  constructor (
    private readonly storage: StorageService
  ) {}

  async getStage (): Promise<EventStage> {
    return await this.storage.getEphemeral('stage', EventStage.WAITING_FOR_TEAMS) as EventStage
  }
}
