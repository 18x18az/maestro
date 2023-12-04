import { Injectable, Logger } from '@nestjs/common'
import { CompetitionFieldPublisher } from './competition-field.publisher'
import { CompetitionFieldRepo } from './competition-field.repo'
import { FieldService } from '../../field/field'

@Injectable()
export class VacancyService {
  private readonly logger: Logger = new Logger(VacancyService.name)
  private readonly queueableFields: number[] = []
  private readonly vacantFields: number[] = []

  constructor (
    private readonly publisher: CompetitionFieldPublisher,
    private readonly fields: FieldService,
    private readonly repo: CompetitionFieldRepo
  ) { }

  private async publishQueueableFields (): Promise<void> {
    const fields = await Promise.all(this.queueableFields.map(async id => { return await this.fields.getField(id) }))
    await this.publisher.publishQueueableFields(fields)
  }

  private async publishVacantFields (): Promise<void> {
    const fields = await Promise.all(this.vacantFields.map(async id => { return await this.fields.getField(id) }))
    await this.publisher.publishVacantFields(fields)
  }

  async onApplicationBootstrap (): Promise<void> {
    const fields = await this.fields.getCompetitionFields()
    for (const field of fields) {
      const onDeck = await this.repo.getMatchOnDeck(field.id)
      const onField = await this.repo.getMatchOnField(field.id)

      if (onDeck === null) {
        this.queueableFields.push(field.id)
      }

      if (onField === null) {
        this.vacantFields.push(field.id)
      }
    }

    this.logger.log(`Queueable fields: [${this.queueableFields.join(', ')}]`)
    this.logger.log(`Vacant fields: [${this.vacantFields.join(', ')}]`)
    await this.publishVacantFields()
    await this.publishQueueableFields()
  }

  async onFieldUpdate (fieldId: number): Promise<void> {
    const wasVacant = this.vacantFields.includes(fieldId)
    const wasQueueable = this.queueableFields.includes(fieldId)

    const isVacant = await this.repo.getMatchOnField(fieldId) === null
    const isQueueable = await this.repo.getMatchOnDeck(fieldId) === null

    const vacancyChanged = wasVacant !== isVacant
    const queueabilityChanged = wasQueueable !== isQueueable

    if (vacancyChanged) {
      if (isVacant) {
        this.logger.log(`Field ${fieldId} is now vacant`)
        this.vacantFields.push(fieldId)
      } else {
        this.logger.log(`Field ${fieldId} is no longer vacant`)
        this.vacantFields.splice(this.vacantFields.indexOf(fieldId), 1)
      }
      await this.publishVacantFields()
    }

    if (queueabilityChanged) {
      if (isQueueable) {
        this.logger.log(`Field ${fieldId} is now queueable`)
        this.queueableFields.push(fieldId)
      } else {
        this.logger.log(`Field ${fieldId} is no longer queueable`)
        this.queueableFields.splice(this.queueableFields.indexOf(fieldId), 1)
      }
      await this.publishQueueableFields()
    }
  }
}
