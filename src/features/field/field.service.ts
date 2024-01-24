import { Injectable, Logger } from '@nestjs/common'
import { FieldEntity } from './field.entity'
import { FieldUpdate } from './field.mutation'
import { FieldRepo } from './field.repo'
import { EnableFieldEvent } from './enable-field.event'
import { DisableFieldEvent } from './disable-field.event'
import { FindFieldsArgs } from './dto/find-fields.args'

@Injectable()
export class FieldService {
  private readonly logger = new Logger(FieldService.name)

  constructor (
    private readonly repo: FieldRepo,
    private readonly enableFieldEvent: EnableFieldEvent,
    private readonly disableFieldEvent: DisableFieldEvent
  ) {}

  async onApplicationBootstrap (): Promise<void> {
    const fields = await this.getAllFields()
    if (fields.length > 0) return

    this.logger.log('No fields found, initializing with default fields')
    for (let i = 0; i < 3; i++) {
      await this.addField()
    }
  }

  async getAllFields (): Promise<FieldEntity[]> {
    return await this.repo.find()
  }

  async getFields (args: FindFieldsArgs): Promise<FieldEntity[]> {
    return await this.repo.findWhere(args)
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

  private async enableOrCreateNFields (n: number): Promise<void> {
    const allFields = await this.getAllFields()
    const disabledCompetitionFields = allFields.filter(field => !field.isEnabled && field.isCompetition)
    const numberToCreate = n - disabledCompetitionFields.length

    if (numberToCreate > 0) {
      this.logger.log(`Creating ${numberToCreate} fields`)
      for (let i = 0; i < numberToCreate; i++) {
        const newField = await this.addField()
        disabledCompetitionFields.push(newField)
      }
    }

    this.logger.log(`Enabling ${disabledCompetitionFields.length} fields`)
    for (const field of disabledCompetitionFields.slice(0, n)) {
      await this.updateField(field.id, { isEnabled: true })
    }
  }

  async configureCompetitionFields (fieldNames: string[]): Promise<void> {
    const existingCompetitionFields = await this.getCompetitionFields()
    const neededFields = fieldNames.length - existingCompetitionFields.length

    if (neededFields > 0) {
      await this.enableOrCreateNFields(neededFields)
    } else if (neededFields < 0) {
      this.logger.log(`Disabling ${-neededFields} fields`)
      for (const field of existingCompetitionFields.slice(neededFields)) {
        await this.updateField(field.id, { isEnabled: false })
      }
    }

    const competitionFields = await this.getCompetitionFields()
    if (competitionFields.length !== fieldNames.length) {
      throw new Error('Invalid number of competition fields')
    }

    for (let i = 0; i < fieldNames.length; i++) {
      const field = competitionFields[i]
      await this.updateField(field.id, { name: fieldNames[i] })
    }
  }

  async getCompetitionFields (): Promise<FieldEntity[]> {
    return await this.repo.findEnabledCompetition()
  }

  async addField (): Promise<FieldEntity> {
    this.logger.log('Adding field')
    return await this.repo.createUnnamedField(true)
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

  async deleteField (id: number): Promise<void> {
    this.logger.log(`Deleting field ${id}`)
    await this.repo.delete(id)
  }
}
