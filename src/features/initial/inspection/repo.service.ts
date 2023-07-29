import { INSPECTION_STAGE } from '@18x18az/rosetta'
import { InMemoryDBEntity, InMemoryDBService } from '@nestjs-addons/in-memory-db'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../utils/prisma/prisma.service'
import { InspectionChecklist } from './inspection.dto'

export interface InspectionRollup extends InMemoryDBEntity {
  team: string
  status: INSPECTION_STAGE
}

@Injectable()
export class InspectionDatabase {
  constructor (private readonly prisma: PrismaService, private readonly cache: InMemoryDBService<InspectionRollup>) {}

  private async getRequiredNumberOfCriteria (): Promise<number> {
    return await this.prisma.inspectionCriteria.count()
  }

  private async getNumberOfCriteriaMet (team: string): Promise<number> {
    return await this.prisma.checkedInspection.count({ where: { teamNumber: team } })
  }

  async getCriteriaMet (team: string): Promise<number[]> {
    const points = await this.prisma.team.findUnique({ where: { number: team } }).checkedPoints({ select: { criteriaId: true } })

    if (points === null) return []

    return points.map(point => point.criteriaId)
  }

  private getRollup (team: string): InspectionRollup {
    return this.cache.get(team)
  }

  async markCheckinStage (team: string, status: INSPECTION_STAGE): Promise<INSPECTION_STAGE> {
    await this.prisma.checkIn.upsert({ where: { teamNumber: team }, update: { status }, create: { teamNumber: team, status } })
    const existing = this.getRollup(team)
    if (status === INSPECTION_STAGE.CHECKED_IN) {
      status = await this.evaluateInspectionProgress(team)
    }
    existing.status = status
    this.cache.update(existing)
    return status
  }

  async getInspectionChecklist (): Promise<InspectionChecklist> {
    const output = {}
    const groups = await this.prisma.inspectionGroup.findMany({ include: { criteria: true } })
    groups.forEach(group => {
      const criteria = Array.from(group.criteria.values()).map(criteria => { return { text: criteria.text, uuid: criteria.id } })
      output[group.name] = criteria
    })
    return output
  }

  getTeamsByStage (stage: INSPECTION_STAGE): string[] {
    return this.cache.getAll().filter(rollup => rollup.status === stage).map(rollup => rollup.team)
  }

  async markMetOrNot (team: string, criteria: number, met: boolean): Promise<INSPECTION_STAGE> {
    if (met) {
      await this.prisma.checkedInspection.create({ data: { teamNumber: team, criteriaId: criteria } })
    } else {
      await this.prisma.checkedInspection.delete({ where: { teamNumber_criteriaId: { teamNumber: team, criteriaId: criteria } } })
    }
    const existing = this.getRollup(team)
    existing.status = await this.evaluateInspectionProgress(team)
    this.cache.update(existing)
    return existing.status
  }

  async evaluateInspectionProgress (team: string): Promise<INSPECTION_STAGE> {
    const current = await this.getNumberOfCriteriaMet(team)
    if (current === await this.getRequiredNumberOfCriteria()) {
      return INSPECTION_STAGE.COMPLETE
    } else if (current > 0) {
      return INSPECTION_STAGE.PARTIAL
    } else {
      return INSPECTION_STAGE.CHECKED_IN
    }
  }

  async initialLoad (team: string): Promise<INSPECTION_STAGE> {
    let stage = (await this.prisma.checkIn.findUnique({ where: { teamNumber: team } }))?.status as INSPECTION_STAGE

    if (stage === undefined) {
      stage = INSPECTION_STAGE.NOT_HERE
    }

    if (stage === INSPECTION_STAGE.CHECKED_IN) {
      stage = await this.evaluateInspectionProgress(team)
    }

    const teamRollup: InspectionRollup = { id: team, team, status: stage }
    this.cache.create(teamRollup)
    return stage
  }

  getStage (team: string): INSPECTION_STAGE {
    return this.getRollup(team).status
  }
}
