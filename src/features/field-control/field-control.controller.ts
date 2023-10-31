import { Controller } from '@nestjs/common'
import { EventPattern } from '@nestjs/microservices'
import { EventStage, STAGE_TOPIC } from '../stage'
import { FieldControlInternal } from './field-control.internal'

@Controller('fieldControl')
export class FieldControlController {
  constructor (private readonly service: FieldControlInternal) {}

  @EventPattern(STAGE_TOPIC)
  async handleStage (stage: { stage: EventStage }): Promise<void> {
    await this.service.handleStage(stage.stage)
  }
}
