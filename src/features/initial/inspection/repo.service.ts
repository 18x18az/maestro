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

  async getTotalNumberOfCriteria (): Promise<number> {
    return await this.prisma.inspectionCriteria.count()
  }

  async getNumberOfCriteriaMet (team: string): Promise<number> {
    return await this.prisma.checkedInspection.count({ where: { teamNumber: team } })
  }

  async getCriteriaMet (team: string): Promise<number[]> {
    const points = await this.prisma.team.findUnique({ where: { number: team } }).checkedPoints({ select: { criteriaId: true } })

    if (points === null) return []

    return points.map(point => point.criteriaId)
  }

  upsertStatus (team: string, status: INSPECTION_STAGE): void {
    const cached = this.cache.get(team)

    if (cached === undefined) {
      this.cache.create({ id: team, team, status })
      return
    }

    cached.status = status
    this.cache.update(cached)
  }

  private getRollup (team: string): InspectionRollup {
    return this.cache.get(team)
  }

  async getCheckinStage (team: string): Promise<INSPECTION_STAGE | undefined> {
    const checkin = await this.prisma.checkIn.findUnique({ where: { teamNumber: team } })

    if (checkin === null) return undefined

    return checkin.status as INSPECTION_STAGE
  }

  async setCheckinStage (team: string, status: INSPECTION_STAGE): Promise<void> {
    await this.prisma.checkIn.upsert({ where: { teamNumber: team }, update: { status }, create: { teamNumber: team, status } })
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

  async markCriteriaMet (team: string, criteria: number): Promise<void> {
    await this.prisma.checkedInspection.create({ data: { teamNumber: team, criteriaId: criteria } })
  }

  async markCriteriaNotMet (team: string, criteria: number): Promise<void> {
    await this.prisma.checkedInspection.delete({ where: { teamNumber_criteriaId: { teamNumber: team, criteriaId: criteria } } })
  }

  getStage (team: string): INSPECTION_STAGE {
    return this.getRollup(team).status
  }
}
