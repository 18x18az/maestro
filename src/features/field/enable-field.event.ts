import { Injectable } from '@nestjs/common'
import { EventService } from '../../utils/classes/event-service'
import { FieldRepo } from './field.repo'
import { FieldEntity } from './field.entity'

interface EnableFieldPayload {
  id: number
}

export interface EnableFieldContext extends EnableFieldPayload {
  isCompetition: boolean
}

@Injectable()
export class EnableFieldEvent extends EventService<EnableFieldPayload, EnableFieldContext, FieldEntity> {
  constructor (private readonly fieldRepo: FieldRepo) { super() }

  async onApplicationBootstrap (): Promise<void> {
    const enabled = await this.fieldRepo.getEnabledFields()
    this.logger.log(`Enabling ${enabled.length} existing fields`)

    for (const field of enabled) {
      const id = field.id
      await this.execute({ id })
    }
  }

  protected async getContext (data: EnableFieldPayload): Promise<EnableFieldContext> {
    const isCompetition = await this.fieldRepo.isCompetition(data.id)
    return { ...data, isCompetition }
  }

  protected async doExecute (data: EnableFieldContext): Promise<FieldEntity> {
    return await this.fieldRepo.setFieldEnabled(data.id, true)
  }
}
