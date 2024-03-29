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
    if (args.skillsEnabled === true) {
      // return all fields that are either not competition or have skills enabled
      const fields = await this.fieldRepository.find({
        where: [
          { isCompetition: false },
          { skillsEnabled: true }
        ]
      })

      if (args.isEnabled !== undefined) {
        return fields.filter(field => field.isEnabled === args.isEnabled)
      }
      return fields
    }
    return await this.fieldRepository.find({
      where:
      {
        isEnabled: args.isEnabled,
        isCompetition: args.isCompetition,
        skillsEnabled: args.skillsEnabled
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

  async delete (id: number): Promise<void> {
    await this.fieldRepository.delete(id)
  }

  async setSkillsEnabled (enabled: boolean): Promise<void> {
    // set skills enabled for all competition fields
    const competitionFields = await this.fieldRepository.findBy({ isCompetition: true })
    for (const field of competitionFields) {
      field.skillsEnabled = enabled
      await this.fieldRepository.save(field)
    }
  }
}
