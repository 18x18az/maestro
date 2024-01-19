import { BadRequestException, Injectable } from '@nestjs/common'
import { EventService } from '../../../utils/classes/event-service'
import { CompetitionFieldEntity } from './competition-field.entity'
import { CompetitionFieldRepo } from './competition-field.repo'
import { RemoveOnTableSittingEvent } from './remove-on-table-sitting.event'

export interface RemoveOnFieldSittingPayload {
  fieldId: number
}

export interface RemoveOnFieldSittingContext extends RemoveOnFieldSittingPayload {
  field: CompetitionFieldEntity
}

@Injectable()
export class RemoveOnFieldSittingEvent extends EventService<RemoveOnFieldSittingPayload, RemoveOnFieldSittingContext, RemoveOnFieldSittingContext> {
  constructor (
    private readonly repo: CompetitionFieldRepo,
    private readonly removeOnTable: RemoveOnTableSittingEvent
  ) { super() }

  protected async getContext (data: RemoveOnFieldSittingPayload): Promise<RemoveOnFieldSittingContext> {
    const field = await this.repo.getCompetitionField(data.fieldId)

    if (field === null) throw new BadRequestException('Field is not set as a competition field')
    if (field.onFieldSitting === null) throw new BadRequestException('Field is not occupied')

    return {
      ...data,
      field
    }
  }

  protected async doExecute (data: RemoveOnFieldSittingContext): Promise<RemoveOnFieldSittingContext> {
    await this.repo.removeOnFieldSitting(data.fieldId)
    const onTable = data.field.onTableSittingId

    if (onTable !== null) {
      await this.removeOnTable.execute({ fieldId: data.fieldId })
      await this.repo.putOnField(data.fieldId, onTable)
    }

    const updated = await this.repo.getCompetitionField(data.fieldId)
    if (updated === null) throw new Error('Field disappeared')
    return {
      ...data,
      field: updated
    }
  }
}
