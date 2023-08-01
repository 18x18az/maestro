import { INSPECTION_STAGE } from '@18x18az/rosetta'
import { Injectable } from '@nestjs/common'
import { InspectionDatabase } from '../repo.service'

@Injectable()
export class TeamModel {
  constructor (private readonly repo: InspectionDatabase) {}

  async markCheckinStage (team: string, status: INSPECTION_STAGE): Promise<INSPECTION_STAGE> {
    await this.repo.setCheckinStage(team, status)

    if (status === INSPECTION_STAGE.CHECKED_IN) {
      status = await this.evaluateInspectionProgress(team)
    }

    this.repo.upsertStatus(team, status)

    return status
  }

  async markInspectionCheckbox (team: string, criteria: number, met: boolean): Promise<INSPECTION_STAGE> {
    if (met) {
      await this.repo.markCriteriaMet(team, criteria)
    } else {
      await this.repo.markCriteriaNotMet(team, criteria)
    }

    const status = await this.evaluateInspectionProgress(team)

    this.repo.upsertStatus(team, status)

    return status
  }

  async getCriteriaMet (team: string): Promise<number[]> {
    return await this.repo.getCriteriaMet(team)
  }

  private async evaluateInspectionProgress (team: string): Promise<INSPECTION_STAGE> {
    const currentPromise = this.repo.getNumberOfCriteriaMet(team)
    const totalPromise = this.repo.getTotalNumberOfCriteria()

    const current = await currentPromise
    const total = await totalPromise

    if (current === total) {
      return INSPECTION_STAGE.COMPLETE
    } else if (current > 0) {
      return INSPECTION_STAGE.PARTIAL
    } else {
      return INSPECTION_STAGE.CHECKED_IN
    }
  }

  async initialLoad (team: string): Promise<INSPECTION_STAGE> {
    let stage = await this.repo.getCheckinStage(team)

    if (stage === undefined) {
      await this.repo.setCheckinStage(team, INSPECTION_STAGE.NOT_HERE)
      stage = INSPECTION_STAGE.NOT_HERE
    }

    if (stage === INSPECTION_STAGE.CHECKED_IN) {
      stage = await this.evaluateInspectionProgress(team)
    }

    this.repo.upsertStatus(team, stage)

    return stage
  }

  getStage (team: string): INSPECTION_STAGE {
    return this.repo.getStage(team)
  }
}
