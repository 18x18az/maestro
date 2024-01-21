import { BadRequestException, Injectable } from '@nestjs/common'
import { EventService } from '../../../utils/classes/event-service'
import { CompetitionFieldEntity } from './competition-field.entity'
import { CompetitionFieldRepo } from './competition-field.repo'
import { CompetitionFieldControlCache } from './competition-field-control.cache'

interface QueueSittingPayload {
  sittingId: number
  fieldId: number
}

interface QueueSittingContext extends QueueSittingPayload {
  field: CompetitionFieldEntity
}

interface QueueSittingResult extends QueueSittingContext {
  location: 'ON_TABLE' | 'ON_FIELD'
}

@Injectable()
export class QueueSittingEvent extends EventService<QueueSittingPayload, QueueSittingContext, QueueSittingResult> {
  constructor (
    private readonly repo: CompetitionFieldRepo,
    private readonly cache: CompetitionFieldControlCache
  ) { super() }

  protected async getContext (data: QueueSittingPayload): Promise<QueueSittingContext> {
    const field = await this.repo.getCompetitionField(data.fieldId)

    if (field === null) throw new BadRequestException('Field is not set as a competition field')

    if (field.onTableSittingId !== null) throw new BadRequestException('Field is already full')

    return {
      ...data,
      field
    }
  }

  protected async doExecute (data: QueueSittingContext): Promise<QueueSittingResult> {
    console.log('QueueSittingEvent.doExecute')
    const { field } = data
    let location: 'ON_TABLE' | 'ON_FIELD' = 'ON_TABLE'
    if (field.onFieldSittingId === null) {
      this.logger.log(`Putting sitting ${data.sittingId} on field ${data.fieldId}`)
      location = 'ON_FIELD'
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
      field: updated,
      location
    }
  }
}
