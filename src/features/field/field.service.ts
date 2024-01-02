import { Injectable, Logger } from '@nestjs/common'
import { FieldEntity } from './field.entity'
import { FieldUpdate } from './field.mutation'
import { FieldRepo } from './field.repo'
import { EnableFieldEvent } from './enable-field.event'
import { DisableFieldEvent } from './disable-field.event'

@Injectable()
export class FieldService {
  private readonly logger = new Logger(FieldService.name)

  constructor (
    private readonly repo: FieldRepo,
    private readonly enableFieldEvent: EnableFieldEvent,
    private readonly disableFieldEvent: DisableFieldEvent
  ) {}

  async onApplicationBootstrap (): Promise<void> {
    const fields = await this.getFields()
    if (fields.length > 0) return

    this.logger.log('No fields found, initializing with default fields')
    for (let i = 0; i < 3; i++) {
      await this.addField()
    }
  }

  async getFields (): Promise<FieldEntity[]> {
    return await this.repo.find()
  }

  async isEnabled (fieldId: number): Promise<boolean> {
    const field = await this.repo.findByIdOrFail(fieldId)
    return field.isEnabled
  }

  async isCompetition (fieldId: number): Promise<boolean> {
    const field = await this.repo.findByIdOrFail(fieldId)
    return field.isCompetition
  }

  async getEnabledFields (): Promise<FieldEntity[]> {
    return await this.repo.findEnabled()
  }

  async getCompetitionFields (): Promise<FieldEntity[]> {
    return await this.repo.findEnabledCompetition()
  }

  async addField (): Promise<FieldEntity> {
    this.logger.log('Adding field')
    return await this.repo.createUnnamedField()
  }

  async updateField (id: number, update: FieldUpdate): Promise<FieldEntity> {
    let field = await this.repo.findByIdOrFail(id)
    this.logger.log(`Updating field ${id}`)

    const { name, isCompetition, canRunSkills, isEnabled } = update

    if (name !== undefined) field.name = name
    if (isCompetition !== undefined) field.isCompetition = isCompetition
    if (canRunSkills !== undefined) field.skillsEnabled = canRunSkills

    await this.repo.save(field)

    if (isEnabled !== undefined) {
      if (isEnabled) {
        field = await this.enableFieldEvent.execute({ id })
      } else {
        field = await this.disableFieldEvent.execute({ id })
      }
    }

    return field
  }

  async getField (id: number): Promise<FieldEntity> {
    return await this.repo.findByIdOrFail(id)
  }
}
