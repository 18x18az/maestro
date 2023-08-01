import { INSPECTION_STAGE } from '@18x18az/rosetta'
import { Injectable } from '@nestjs/common'
import { InspectionDatabase } from '../repo.service'
import { InspectionChecklist } from '../inspection.dto'

@Injectable()
export class OverallModel {
  constructor (private readonly repo: InspectionDatabase) {}

  getTeamsByStage (stage: INSPECTION_STAGE): string[] {
    return this.repo.getTeamsByStage(stage)
  }

  async getInspectionChecklist (): Promise<InspectionChecklist> {
    return await this.repo.getInspectionChecklist()
  }
}
