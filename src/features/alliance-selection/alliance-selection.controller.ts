import { Body, Controller, Post } from '@nestjs/common'
import { EventStage, STAGE_TOPIC } from '../stage'
import { EventPattern } from '@nestjs/microservices'
import { AllianceSelectionInternal } from './alliance-selection.internal'

@Controller('allianceSelection')
export class AllianceSelectionController {
  constructor (private readonly service: AllianceSelectionInternal) {}

  @EventPattern(STAGE_TOPIC)
  async handleStage (stage: { stage: EventStage }): Promise<void> {
    await this.service.handleStage(stage.stage)
  }

  @Post('pick')
  async pickTeam (@Body() body: { team: string }): Promise<void> {
    await this.service.pick(body.team)
  }

  @Post('accept')
  async accept (): Promise<void> {
    await this.service.accept()
  }

  @Post('decline')
  async decline (): Promise<void> {
    await this.service.decline()
  }

  @Post('cancel')
  async cancel (): Promise<void> {
    await this.service.cancel()
  }

  @Post('undo')
  async undo (): Promise<void> {
    await this.service.undo()
  }
}
