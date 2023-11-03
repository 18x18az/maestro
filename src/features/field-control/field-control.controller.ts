import { Controller, Post } from '@nestjs/common'
import { EventPattern } from '@nestjs/microservices'
import { EventStage, STAGE_TOPIC } from '../stage'
import { FieldControlInternal } from './field-control.internal'
import { CURRENT_BLOCK_TOPIC, MatchBlock } from '../match'
import { TimeoutService } from './timeout.service'

@Controller('fieldControl')
export class FieldControlController {
  constructor (
    private readonly service: FieldControlInternal,
    private readonly timeout: TimeoutService
  ) {}

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

  @Post('start')
  async startMatch (): Promise<void> {
    await this.service.startMatch()
  }

  @Post('resume')
  async resumeMatch (): Promise<void> {
    await this.service.resumeMatch()
  }

  @Post('endEarly')
  async endEarly (): Promise<void> {
    await this.service.endEarly()
  }

  @Post('timeout')
  async callTimeout (): Promise<void> {
    await this.timeout.callTimeout()
  }
}
