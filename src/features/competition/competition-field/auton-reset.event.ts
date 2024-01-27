import { BadRequestException, Injectable } from '@nestjs/common'
import { EventService } from '../../../utils/classes/event-service'
import { MATCH_STAGE } from './competition-field.interface'
import { CompetitionFieldControlCache } from './competition-field-control.cache'
import { LoadFieldEvent } from '../../field-control/load-field.event'
import { CONTROL_MODE } from '../../field-control/field-control.interface'
import { TimingService } from './timing.service'

interface AutonResetPayload {
  fieldId: number
}

@Injectable()
export class AutonResetEvent extends EventService<AutonResetPayload, AutonResetPayload, AutonResetPayload> {
  constructor (
    private readonly cache: CompetitionFieldControlCache,
    private readonly loadField: LoadFieldEvent,
    private readonly timing: TimingService
  ) { super() }

  async doExecute (data: AutonResetPayload): Promise<AutonResetPayload> {
    const stage = await this.cache.get(data.fieldId)
    if (stage !== MATCH_STAGE.SCORING_AUTON) throw new BadRequestException(`Cannot reset field ${data.fieldId} from stage ${stage}`)
    this.logger.log(`Resetting auto on ${data.fieldId}`)
    this.cache.set(data.fieldId, MATCH_STAGE.QUEUED)
    await this.loadField.execute({ fieldId: data.fieldId, mode: CONTROL_MODE.AUTO, duration: await this.timing.getAutonLength() })
    return data
  }
}
