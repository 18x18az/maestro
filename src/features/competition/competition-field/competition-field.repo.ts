import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CompetitionFieldEntity } from './competition-field.entity'
import { Repository } from 'typeorm'
import { SittingEntity } from '../match/sitting.entity'
import { FieldEntity } from '../../field/field.entity'

@Injectable()
export class CompetitionFieldRepo {
  private readonly logger: Logger = new Logger(CompetitionFieldRepo.name)

  constructor (@InjectRepository(CompetitionFieldEntity) private readonly repo: Repository<CompetitionFieldEntity>) {}

  async getOnFieldSitting (fieldId: number): Promise<SittingEntity | null> {
    const data = await this.repo.findOne({ where: { fieldId }, relations: ['onFieldSitting'] })

    if (data === null) return null

    return data.onFieldSitting
  }

  async getOnTableSitting (fieldId: number): Promise<SittingEntity | null> {
    const data = await this.repo.findOne({ where: { fieldId }, relations: ['onTableSitting'] })

    if (data === null) return null

    return data.onTableSitting
  }

  async removeOnFieldSitting (fieldId: number): Promise<void> {
    // remove the relation but don't actually delete the sitting
    const data = await this.repo.findOneOrFail({ where: { fieldId } })
    data.onFieldSittingId = null
    await this.repo.save(data)
  }

  async removeOnTableSitting (fieldId: number): Promise<void> {
    // remove the relation but don't actually delete the sitting
    const data = await this.repo.findOneOrFail({ where: { fieldId } })
    data.onTableSittingId = null
    await this.repo.save(data)
  }

  async moveOnTableToField (fieldId: number): Promise<void> {
    const data = await this.repo.findOneOrFail({ where: { fieldId } })
    const onTable = data.onTableSittingId

    if (onTable === null) {
      throw new BadRequestException('No sitting on deck')
    }

    data.onFieldSittingId = onTable
    data.onTableSittingId = null
    await this.repo.save(data)
  }

  async putOnField (fieldId: number, sittingId: number): Promise<void> {
    await this.repo.update({ fieldId }, { onFieldSittingId: sittingId })
  }

  async putOnTable (fieldId: number, sittingId: number): Promise<void> {
    await this.repo.update({ fieldId }, { onTableSittingId: sittingId })
  }

  async getSittingLocation (sittingId: number): Promise<{ fieldId: number, location: 'ON_TABLE' | 'ON_FIELD' }> {
    const onTableAt = await this.repo.findOne({ where: { onTableSittingId: sittingId } })
    if (onTableAt !== null) {
      return {
        fieldId: onTableAt.fieldId,
        location: 'ON_TABLE'
      }
    }

    const onFieldAt = await this.repo.findOne({ where: { onFieldSittingId: sittingId } })
    if (onFieldAt !== null) {
      return {
        fieldId: onFieldAt.fieldId,
        location: 'ON_FIELD'
      }
    }

    this.logger.warn(`Sitting ${sittingId} is not on field or on deck`)
    throw new BadRequestException(`Sitting ${sittingId} is not on field or on deck`)
  }

  async getCompetitionField (fieldId: number): Promise<CompetitionFieldEntity | null> {
    return await this.repo.findOne({ where: { fieldId } })
  }

  async createCompetitionField (field: FieldEntity): Promise<CompetitionFieldEntity> {
    return await this.repo.save({ fieldId: field.id })
  }
}
