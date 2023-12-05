import { Injectable } from '@nestjs/common'
import { PublishService } from '@/utils'
import { CompetitionFieldStatus } from './competition-field.interface'
import { Field } from '../../field'

@Injectable()
export class CompetitionFieldPublisher {
  constructor (private readonly publisher: PublishService) { }

  async publishFieldStatus (fieldId: number, status: CompetitionFieldStatus): Promise<void> {
    await this.publisher.broadcast(`competitionField/${fieldId}`, status)
  }

  async publishVacantFields (vacantFields: Field[]): Promise<void> {
    await this.publisher.broadcast('competitionFields/vacant', vacantFields)
  }

  async publishQueueableFields (queueableFields: Field[]): Promise<void> {
    await this.publisher.broadcast('competitionFields/queueable', queueableFields)
  }
}
