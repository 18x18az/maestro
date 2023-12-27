import { Injectable } from '@nestjs/common'
import { EventService } from '../../utils/classes/event-service'
import { FieldRepo } from './field.repo'
import { FieldEntity } from './field.entity'
import { EnableFieldContext } from './enable-field.event'

interface DisableFieldPayload {
  id: number
}

export interface DisableFieldContext extends DisableFieldPayload {
  isCompetition: boolean
}

@Injectable()
export class DisableFieldEvent extends EventService<DisableFieldPayload, DisableFieldContext, FieldEntity> {
  constructor (private readonly fieldRepo: FieldRepo) { super() }

  protected async getContext (data: DisableFieldPayload): Promise<DisableFieldContext> {
    const isCompetition = await this.fieldRepo.isCompetition(data.id)
    return { ...data, isCompetition }
  }

  protected async doExecute (data: EnableFieldContext): Promise<FieldEntity> {
    return await this.fieldRepo.setFieldEnabled(data.id, false)
  }
}
