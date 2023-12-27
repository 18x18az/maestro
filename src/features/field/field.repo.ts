import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FieldEntity } from './field.entity'
import { Repository } from 'typeorm'

@Injectable()
export class FieldRepo {
  constructor (@InjectRepository(FieldEntity) private readonly fieldRepository: Repository<FieldEntity>) { }

  async getEnabledFields (): Promise<number[]> {
    const fields = await this.fieldRepository.findBy({ isEnabled: true })
    return fields.map(field => field.id)
  }

  async isCompetition (fieldId: number): Promise<boolean> {
    const field = await this.fieldRepository.findOneByOrFail({ id: fieldId })
    return field.isCompetition
  }

  async setFieldEnabled (fieldId: number, enabled: boolean): Promise<FieldEntity> {
    const field = await this.fieldRepository.findOneByOrFail({ id: fieldId })
    field.isEnabled = enabled
    return await this.fieldRepository.save(field)
  }

  async find (): Promise<FieldEntity[]> {
    return await this.fieldRepository.find()
  }

  async findByIdOrFail (id: number): Promise<FieldEntity> {
    return await this.fieldRepository.findOneByOrFail({ id })
  }

  async findEnabled (): Promise<number[]> {
    const fields = await this.fieldRepository.findBy({ isEnabled: true })
    return fields.map(field => field.id)
  }

  async findEnabledCompetition (): Promise<number[]> {
    const fields = await this.fieldRepository.findBy({ isEnabled: true, isCompetition: true })
    return fields.map(field => field.id)
  }

  async createUnnamedField (): Promise<FieldEntity> {
    const created = this.fieldRepository.create({ name: 'Unnamed Field' })
    return await this.fieldRepository.save(created)
  }

  async save (field: FieldEntity): Promise<FieldEntity> {
    return await this.fieldRepository.save(field)
  }
}
