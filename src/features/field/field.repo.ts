import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FieldEntity } from './field.entity'
import { Repository } from 'typeorm'
import { FindFieldsArgs } from './dto/find-fields.args'

@Injectable()
export class FieldRepo {
  constructor (@InjectRepository(FieldEntity) private readonly fieldRepository: Repository<FieldEntity>) { }

  async getEnabledFields (): Promise<FieldEntity[]> {
    return await this.fieldRepository.findBy({ isEnabled: true })
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

  async findWhere (args: FindFieldsArgs): Promise<FieldEntity[]> {
    return await this.fieldRepository.find({
      where:
      {
        isEnabled: args.isEnabled,
        isCompetition: args.isCompetition
      }
    })
  }

  async findByIdOrFail (id: number): Promise<FieldEntity> {
    return await this.fieldRepository.findOneByOrFail({ id })
  }

  async findEnabled (): Promise<FieldEntity[]> {
    return await this.fieldRepository.findBy({ isEnabled: true })
  }

  async findEnabledCompetition (): Promise<FieldEntity[]> {
    return await this.fieldRepository.findBy({ isEnabled: true, isCompetition: true })
  }

  async createUnnamedField (isCompetition: boolean): Promise<FieldEntity> {
    const created = this.fieldRepository.create({ name: 'Unnamed Field', isCompetition })
    return await this.fieldRepository.save(created)
  }

  async save (field: FieldEntity): Promise<FieldEntity> {
    return await this.fieldRepository.save(field)
  }
}
