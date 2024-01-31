import { Injectable } from '@nestjs/common'
import { InspectionRepo } from './inspection.repo'
import { vrcPoints } from './vrc.points'
import { Program } from './inspection.interface'
import { InspectionGroupEntity } from './inspection-group.entity'
import { InspectionPointEntity } from './inspection-point.entity'

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
  constructor (private readonly repo: InspectionRepo) {}

  async onModuleInit (): Promise<void> {
    await this.loadInspectionPoints(vrcPoints, Program.VRC)
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
  }
}
