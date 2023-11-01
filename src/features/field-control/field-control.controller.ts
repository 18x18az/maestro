import { Controller, Post } from '@nestjs/common'
import { EventPattern } from '@nestjs/microservices'
import { EventStage, STAGE_TOPIC } from '../stage'
import { FieldControlInternal } from './field-control.internal'
import { CURRENT_BLOCK_TOPIC, MatchBlock } from '../match'

@Controller('fieldControl')
export class FieldControlController {
  constructor (private readonly service: FieldControlInternal) {}

  @EventPattern(STAGE_TOPIC)
  async handleStage (stage: { stage: EventStage }): Promise<void> {
    await this.service.handleStage(stage.stage)
  }

  @Post('nextBlock')
  async cueNextBlock (): Promise<void> {
    await this.service.cueNextBlock()
  }

  @EventPattern(CURRENT_BLOCK_TOPIC)
  async handleCurrentBlockChange (block: MatchBlock | null): Promise<void> {
    await this.service.handleCurrentBlockChange(block)
  }
}
