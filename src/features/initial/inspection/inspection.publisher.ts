import { INSPECTION_STAGE } from '@18x18az/rosetta'
import { Publisher, Payload } from '@alecmmiller/nestjs-client-generator'
import { Injectable } from '@nestjs/common'
import { PublishService } from '../../../utils/publish/publish.service'

@Injectable()
export class InspectionPublisher {
  constructor (
    private readonly publisher: PublishService
  ) { }

  @Publisher('inspection/stage/:stage')
  async publishStage (stage: INSPECTION_STAGE, @Payload({ isArray: true }) teams: string[]): Promise<void> {
    await this.publisher.broadcast(`inspection/stage/${stage as string}`, { teams })
  }

  @Publisher('inspection/team/:team')
  async publishTeam (teamNumber: string, @Payload({}) stage: INSPECTION_STAGE): Promise<void> {
    await this.publisher.broadcast(`inspection/team/${teamNumber}`, stage)
  }

  @Publisher('inspection/canConclude')
  async publishCanConclude (@Payload({}) canConclude: boolean): Promise<void> {
    await this.publisher.broadcast('inspection/canConclude', canConclude)
  }
}
