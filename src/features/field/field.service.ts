import { Injectable, Logger } from '@nestjs/common'
import { FieldEntity } from './field.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { FieldUpdate } from './field.mutation'

@Injectable()
export class FieldService {
  private readonly logger = new Logger(FieldService.name)

  constructor (
    @InjectRepository(FieldEntity) private readonly fieldRepository: Repository<FieldEntity>
  ) {}

  async onApplicationBootstrap (): Promise<void> {
    const fields = await this.fieldRepository.find()
    if (fields.length > 0) return

    this.logger.log('No fields found, initializing with default fields')
    for (let i = 0; i < 3; i++) {
      await this.addField()
    }
  }

  async getFields (): Promise<FieldEntity[]> {
    return await this.fieldRepository.find()
  }

  async addField (): Promise<void> {
    this.logger.log('Adding field')
    await this.fieldRepository.insert({ name: 'Unnamed Field' })
  }

  // async getField (id: number): Promise<Field> {
  //   return await this.repo.get(id)
  // }

  // async getNextField (id: number): Promise<Field> {
  //   return await this.repo.getNextField(id)
  // }

  // async enableSkills (fieldId: number, enabled: boolean): Promise<void> {
  //   await this.repo.setCanBeUsedForSkills(fieldId, enabled)
  //   await this.publishFields()
  // }

  async updateField (fieldId: number, update: FieldUpdate): Promise<FieldEntity> {
    const field = await this.fieldRepository.findOneByOrFail({ id: fieldId })

    console.log(update)

    const { name, isCompetition, canRunSkills, isEnabled } = update
    console.log(isEnabled)

    if (name !== undefined) field.name = name
    if (isCompetition !== undefined) field.isCompetition = isCompetition
    if (canRunSkills !== undefined) field.skillsEnabled = canRunSkills
    if (isEnabled !== undefined) field.isEnabled = isEnabled

    return await this.fieldRepository.save(field)
  }
}
