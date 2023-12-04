import { Body, Controller, Param, Post } from '@nestjs/common'
import { CompetitionControlService } from './competition-control.service'

@Controller('competitionControl')
export class CompetitionControlController {
  constructor (private readonly service: CompetitionControlService) { }

  @Post('onDeck')
  async setOnDeckField (@Body() body: { fieldId: number }): Promise<void> {
    await this.service.markFieldAsOnDeck(body.fieldId)
  }

  @Post('pushActive')
  async pushActiveMatch (): Promise<void> {
    await this.service.makeOnDeckFieldCurrent()
  }

  @Post('start')
  async startPeriod (): Promise<void> {
    await this.service.startPeriod()
  }

  @Post('reset')
  async reset (): Promise<void> {
    await this.service.reset()
  }

  @Post('match/:matchId/replay')
  async replayMatch (@Param('matchId') matchId: number): Promise<void> {
    await this.service.replayMatch(matchId)
  }
}
