import { Injectable } from '@nestjs/common'
import { EventService } from '../../../utils/classes/event-service'
import { FieldEntity } from '../../field/field.entity'
import { CompetitionFieldRepo } from './competition-field.repo'
import { CompetitionFieldEntity } from './competition-field.entity'

interface EnableCompetitionFieldPayload {
  field: FieldEntity
}

interface EnableCompetitionFieldResult extends EnableCompetitionFieldPayload {
  competition: CompetitionFieldEntity
}

@Injectable()
export class EnableCompetitionFieldEvent extends EventService<EnableCompetitionFieldPayload, EnableCompetitionFieldPayload, EnableCompetitionFieldResult> {
  constructor (private readonly repo: CompetitionFieldRepo) {
    super()
  }

  protected async doExecute (data: EnableCompetitionFieldPayload): Promise<EnableCompetitionFieldResult> {
    this.logger.log(`Enabling competition field for field ${data.field.name}`)
    const created = await this.repo.createCompetitionField(data.field)
    return {
      ...data,
      competition: created
    }
  }
}
