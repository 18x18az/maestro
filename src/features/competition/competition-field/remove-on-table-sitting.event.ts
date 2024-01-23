import { BadRequestException, Injectable } from '@nestjs/common'
import { EventService } from '../../../utils/classes/event-service'
import { CompetitionFieldEntity } from './competition-field.entity'
import { CompetitionFieldRepo } from './competition-field.repo'
import { TableEmptyEvent } from './table-empty.event'

export interface RemoveOnTableSittingPayload {
  fieldId: number
}

export interface RemoveOnTableSittingContext extends RemoveOnTableSittingPayload {
  field: CompetitionFieldEntity
}

@Injectable()
export class RemoveOnTableSittingEvent extends EventService<RemoveOnTableSittingPayload, RemoveOnTableSittingContext, RemoveOnTableSittingContext> {
  constructor (
    private readonly repo: CompetitionFieldRepo,
    private readonly tableEmptyEvent: TableEmptyEvent
  ) { super() }

  protected async getContext (data: RemoveOnTableSittingPayload): Promise<RemoveOnTableSittingContext> {
    const field = await this.repo.getCompetitionField(data.fieldId)

    if (field === null) throw new BadRequestException('Field is not set as a competition field')
    if (field.onFieldSitting === null) throw new BadRequestException('Field is not occupied')

    return {
      ...data,
      field
    }
  }

  protected async doExecute (data: RemoveOnTableSittingContext): Promise<RemoveOnTableSittingContext> {
    await this.repo.removeOnTableSitting(data.fieldId)
    await this.tableEmptyEvent.execute({ fieldId: data.fieldId })
    const updated = await this.repo.getCompetitionField(data.fieldId)
    if (updated === null) throw new Error('Field disappeared')
    return {
      ...data,
      field: updated
    }
  }
}
