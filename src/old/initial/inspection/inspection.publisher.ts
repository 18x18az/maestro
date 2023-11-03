import { Publisher, Payload } from '@alecmmiller/nestjs-client-generator'
import { Injectable } from '@nestjs/common'
import { PublishService } from '../../../old_utils/publish/publish.service'
import { INSPECTION_STAGE, InspectionSectionDataBroadcast } from './inspection.interface'

@Injectable()
export class InspectionPublisher {
  constructor (
    private readonly publisher: PublishService
  ) { }

  @Publisher('inspection/stage/:stage')
  async publishStage (stage: INSPECTION_STAGE, @Payload({ isArray: true, type: String }) teams: string[]): Promise<void> {
    await this.publisher.broadcast(`inspection/stage/${stage as string}`, { teams })
  }

  @Publisher('inspection/team/:team/inspection')
  async publishInspection (teamNumber: string, @Payload({ isArray: true, type: InspectionSectionDataBroadcast }) inspection: InspectionSectionDataBroadcast[]): Promise<void> {
    await this.publisher.broadcast(`inspection/team/${teamNumber}/inspection`, inspection)
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
