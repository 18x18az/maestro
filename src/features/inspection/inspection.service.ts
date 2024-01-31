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

  async getInspectionPoints (groupId: number): Promise<InspectionPointEntity[]> {
    return await this.repo.getInspectionPoints(groupId)
  }
}
