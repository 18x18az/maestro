import { BadRequestException, Injectable } from '@nestjs/common'
import { EventService } from '../../../utils/classes/event-service'
import { CompetitionFieldEntity } from './competition-field.entity'
import { CompetitionFieldRepo } from './competition-field.repo'

interface QueueSittingPayload {
  sittingId: number
  fieldId: number
}

interface QueueSittingContext extends QueueSittingPayload {
  field: CompetitionFieldEntity
}

@Injectable()
export class QueueSittingEvent extends EventService<QueueSittingPayload, QueueSittingContext, QueueSittingContext> {
  constructor (private readonly repo: CompetitionFieldRepo) { super() }

  protected async getContext (data: QueueSittingPayload): Promise<QueueSittingContext> {
    const field = await this.repo.getCompetitionField(data.fieldId)

    if (field === null) throw new BadRequestException('Field is not set as a competition field')

    if (field.onTableSittingId !== null) throw new BadRequestException('Field is already full')

    return {
      ...data,
      field
    }
  }

  protected async doExecute (data: QueueSittingContext): Promise<QueueSittingContext> {
    const { field } = data
    if (field.onFieldSittingId === null) {
      this.logger.log(`Putting sitting ${data.sittingId} on field ${data.fieldId}`)
      await this.repo.putOnField(data.fieldId, data.sittingId)
    } else if (field.onTableSittingId === null) {
      this.logger.log(`Putting sitting ${data.sittingId} on table ${data.fieldId}`)
      await this.repo.putOnTable(data.fieldId, data.sittingId)
    } else {
      throw new Error('Field became full')
    }

    const updated = await this.repo.getCompetitionField(data.fieldId)
    if (updated === null) throw new Error('Field disappeared')
    return {
      ...data,
      field: updated
    }
  }
}
