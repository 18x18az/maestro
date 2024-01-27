import { Injectable } from '@nestjs/common'
import { EventService } from '../../../utils/classes/event-service'
import { CompetitionFieldRepo } from './competition-field.repo'
import { MATCH_STAGE } from './competition-field.interface'
import { CompetitionFieldControlCache } from './competition-field-control.cache'

interface OnFieldPayload {
  fieldId: number
  sittingId: number
}

@Injectable()
export class OnFieldEvent extends EventService<OnFieldPayload, OnFieldPayload, OnFieldPayload> {
  constructor (
    private readonly repo: CompetitionFieldRepo,
    private readonly cache: CompetitionFieldControlCache
  ) { super() }

  protected async doExecute (data: OnFieldPayload): Promise<OnFieldPayload> {
    this.cache.set(data.fieldId, MATCH_STAGE.QUEUED)
    await this.repo.putOnField(data.fieldId, data.sittingId)
    return data
  }
}
