import { Injectable } from '@nestjs/common'
import { EventStage } from './stage.interface'
import { StageInternal } from './stage.internal'

@Injectable()
export class StageService {
  constructor (
    private readonly service: StageInternal
  ) {}

  getStage (): EventStage {
    return this.service.getStage()
  }

  async advanceStage (): Promise<void> {
    await this.service.advanceStage()
  }
}
