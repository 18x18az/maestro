import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { InspectionGroupEntity } from './inspection-group.entity'
import { Repository } from 'typeorm'
import { InspectionPointEntity } from './inspection-point.entity'
import { Program } from './inspection.interface'

@Injectable()
export class InspectionRepo {
  constructor (
    @InjectRepository(InspectionGroupEntity) private readonly inspectionGroupRepo: Repository<InspectionGroupEntity>,
    @InjectRepository(InspectionPointEntity) private readonly inspectionPointRepo: Repository<InspectionPointEntity>
  ) {}

  async getOrCreateInspectionGroup (program: Program, text: string): Promise<InspectionGroupEntity> {
    const group = await this.inspectionGroupRepo.findOne({ where: { program, text } })
    if (group !== null) return group

    return await this.inspectionGroupRepo.save({ program, text })
  }

  async createIfNotExistsInspectionPoint (group: InspectionGroupEntity, text: string): Promise<InspectionPointEntity> {
    const point = await this.inspectionPointRepo.findOne({ where: { groupId: group.id, text } })
    if (point !== null) return point

    return await this.inspectionPointRepo.save({ group, text })
  }

  async getInspectionGroups (): Promise<InspectionGroupEntity[]> {
    return await this.inspectionGroupRepo.find()
  }

  async getInspectionPoints (groupId: number): Promise<InspectionPointEntity[]> {
    return await this.inspectionPointRepo.find({ where: { groupId } })
  }

  async isInspectionPointMet (pointId: number, teamId: number): Promise<boolean> {
    const point = await this.inspectionPointRepo.findOne({ where: { id: pointId }, relations: ['teamsMet'] })

    if (point === null) throw new BadRequestException(`Inspection point ${pointId} does not exist`)

    return point.teamsMet.some(team => team.id === teamId)
  }

  async markInspectionPointMet (pointId: number, teamId: number): Promise<void> {
    const point = await this.inspectionPointRepo.findOne({ where: { id: pointId }, relations: ['teamsMet'] })

    if (point === null) throw new BadRequestException(`Inspection point ${pointId} does not exist`)

    if (point.teamsMet.some(team => team.id === teamId)) return

    point.teamsMet.push({ id: teamId } as any)
    await this.inspectionPointRepo.save(point)
  }

  async markInspectionPointUnmet (pointId: number, teamId: number): Promise<void> {
    const point = await this.inspectionPointRepo.findOne({ where: { id: pointId }, relations: ['teamsMet'] })

    if (point === null) throw new BadRequestException(`Inspection point ${pointId} does not exist`)

    point.teamsMet = point.teamsMet.filter(team => team.id !== teamId)
    await this.inspectionPointRepo.save(point)
  }
}
