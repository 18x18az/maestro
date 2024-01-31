import { BadRequestException, Injectable } from '@nestjs/common'
import { InspectionRepo } from './inspection.repo'
import { vrcPoints } from './vrc.points'
import { Program } from './inspection.interface'
import { InspectionGroupEntity } from './inspection-group.entity'
import { InspectionPointEntity } from './inspection-point.entity'
import { TeamListUpdateContext, TeamListUpdateEvent } from '../team/team-list-update.event'
import { TeamService } from '../team/team.service'
import { Inspection } from '../team/team.interface'

interface InspectionPointSeed {
  text: string
  points: string[]
}

export class TeamInspectionGroupEntity extends InspectionGroupEntity {
  teamId: number
}

export class TeamInspectionPointEntity extends InspectionPointEntity {
  teamId: number
}

@Injectable()
export class InspectionService {
  private readonly summary: Map<number, Inspection> = new Map()
  constructor (
    private readonly repo: InspectionRepo,
    private readonly teamUpdate: TeamListUpdateEvent,
    private readonly teams: TeamService
  ) {}

  async onModuleInit (): Promise<void> {
    await this.loadInspectionPoints(vrcPoints, Program.VRC)
    this.teamUpdate.registerOnComplete(this.onTeamListUpdate.bind(this))
  }

  async onTeamListUpdate (data: TeamListUpdateContext): Promise<void> {
    const rollupPromises = data.teams.map(async team => {
      const { id } = await this.teams.getTeamByNumber(team.number)
      await this.rollup(id)
    })

    await Promise.all(rollupPromises)
  }

  getInspectionSummary (teamId: number): Inspection {
    const summary = this.summary.get(teamId)
    if (summary === undefined) throw new BadRequestException('No inspection summary for team')
    return summary
  }

  async loadInspectionPoints (points: InspectionPointSeed[], program: Program): Promise<void> {
    const createGroupPromises = points.map(async ({ text, points }) => {
      const group = await this.repo.getOrCreateInspectionGroup(program, text)
      const createPointPromises = points.map(async point => {
        await this.repo.createIfNotExistsInspectionPoint(group, point)
      })
      await Promise.all(createPointPromises)
    })
    await Promise.all(createGroupPromises)
  }

  async getInspectionGroups (): Promise<InspectionGroupEntity[]> {
    return await this.repo.getInspectionGroups()
  }

  async rollup (teamId: number): Promise<void> {
    const groups = await this.repo.getInspectionGroups()

    let allMet = true
    let allUnmet = true

    for (const group of groups) {
      const points = await this.repo.getInspectionPoints(group.id)

      for (const point of points) {
        const isMet = await this.repo.isInspectionPointMet(point.id, teamId)

        if (!isMet) {
          allMet = false
          if (!allUnmet && !allMet) {
            break
          }
        }

        if (isMet) {
          allUnmet = false
          if (!allUnmet && !allMet) {
            break
          }
        }
      }

      if (!allUnmet && !allMet) {
        break
      }
    }

    if (allMet) {
      this.summary.set(teamId, Inspection.COMPLETED)
    } else if (allUnmet) {
      this.summary.set(teamId, Inspection.CHECKED_IN)
    } else {
      this.summary.set(teamId, Inspection.IN_PROGRESS)
    }
  }

  async getTeamInspectionGroups (teamId: number): Promise<TeamInspectionGroupEntity[]> {
    const groups = await this.repo.getInspectionGroups()

    return groups.map(group => {
      return { ...group, teamId }
    })
  }

  async getInspectionPoints (groupId: number): Promise<InspectionPointEntity[]> {
    return await this.repo.getInspectionPoints(groupId)
  }

  async getTeamInspectionPoints (groupId: number, teamId: number): Promise<TeamInspectionPointEntity[]> {
    const points = await this.repo.getInspectionPoints(groupId)

    return points.map(point => {
      return { ...point, teamId }
    })
  }

  async getUnmetTeamInspectionPoints (groupId: number, teamId: number): Promise<TeamInspectionPointEntity[]> {
    const points = await this.repo.getInspectionPoints(groupId)

    const filtered = points.filter(async point => {
      return !(await this.isInspectionPointMet(point.id, teamId))
    })

    return filtered.map(point => {
      return { ...point, teamId }
    })
  }

  async isInspectionPointMet (pointId: number, teamId: number): Promise<boolean> {
    return await this.repo.isInspectionPointMet(pointId, teamId)
  }

  async setTeamInspectionPoint (teamId: number, pointId: number, isMet: boolean): Promise<void> {
    if (isMet) {
      await this.repo.markInspectionPointMet(pointId, teamId)
    } else {
      await this.repo.markInspectionPointUnmet(pointId, teamId)
    }
    await this.rollup(teamId)
  }
}
