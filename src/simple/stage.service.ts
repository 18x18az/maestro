import { Injectable } from '@nestjs/common'
import { SimplePublisher } from './simple.publisher'
import { STAGE } from './simple.interface'
import { StorageService } from '@/old_utils/storage/storage.service'

@Injectable()
export class StageService {
  private currentStage: STAGE | null = null

  constructor (
    private readonly publisher: SimplePublisher,
    private readonly storage: StorageService
  ) {}

  async setStage (stage: STAGE): Promise<void> {
    this.currentStage = stage
    await this.storage.setEphemeral('stage', stage)
    await this.publisher.publishStage(stage)
  }

  async getStage (): Promise<STAGE | null> {
    if (this.currentStage === null) {
      const stage = await this.storage.getEphemeral('stage', '')
      if (stage === '') return null

      this.currentStage = stage as STAGE
      await this.publisher.publishStage(this.currentStage)
    }
    return this.currentStage
  }
}
