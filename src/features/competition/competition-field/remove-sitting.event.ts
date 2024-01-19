import { BadRequestException, Injectable } from '@nestjs/common'
import { EventService } from '../../../utils/classes/event-service'
import { CompetitionFieldEntity } from './competition-field.entity'
import { CompetitionFieldRepo } from './competition-field.repo'

export interface RemoveOnFieldSittingPayload {
  fieldId: number
}

export interface RemoveOnFieldSittingContext extends RemoveOnFieldSittingPayload {
  field: CompetitionFieldEntity
}

@Injectable()
export class RemoveOnFieldSittingEvent extends EventService<RemoveOnFieldSittingPayload, RemoveOnFieldSittingContext, RemoveOnFieldSittingContext> {
  constructor (private readonly repo: CompetitionFieldRepo) { super() }
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
    this.logger.log(`Resolving sitting on field ${data.fieldId}`)
    await this.repo.removeOnFieldSitting(data.fieldId)
    const updated = await this.repo.getCompetitionField(data.fieldId)
    if (updated === null) throw new Error('Field disappeared')
    return {
      ...data,
      field: updated
    }
  }
}
