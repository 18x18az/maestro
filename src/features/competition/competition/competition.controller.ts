import { Body, Controller, Param, Post } from '@nestjs/common'
import { CompetitionControlService } from './competition.service'

@Controller('competitionControl')
export class CompetitionControlController {
  constructor (private readonly service: CompetitionControlService) { }

  @Post('onDeck')
  async setOnDeckField (@Body() body: { fieldId: number }): Promise<void> {
    await this.service.markFieldAsOnDeck(body.fieldId)
  }

  @Post('pushLive')
  async pushLiveMatch (): Promise<void> {
    await this.service.makeOnDeckFieldLive()
  }

  @Post('clearLive')
  async clearLiveMatch (): Promise<void> {
    await this.service.clearLiveField()
  }

  @Post('start')
  async startPeriod (): Promise<void> {
    await this.service.startPeriod()
  }

  @Post('stop')
  async stopEarly (): Promise<void> {
    await this.service.stopEarly()
  }

  @Post('reset')
  async reset (): Promise<void> {
    await this.service.readyAutonomous()
  }

  @Post('match/:matchId/replay')
  async replayMatch (@Param('matchId') matchId: number): Promise<void> {
    await this.service.replayMatch(matchId)
  }

  @Post('match/:matchId/remove')
  async removeMatch (@Param('matchId') matchId: number): Promise<void> {
    await this.service.removeMatch(matchId)
  }

  @Post('automation')
  async enableAutomation (@Body() body: { enabled: boolean }): Promise<void> {
    await this.service.enableAutomation(body.enabled)
  }

  @Post('pushResult')
  async pushMatchResult (): Promise<void> {
    await this.service.publishResult()
  }

  @Post('clearResult')
  async clearMatchResult (): Promise<void> {
    await this.service.clearResult()
  }

  @Post('enableSkills')
  async enableSkills (@Body() body: { enabled: boolean }): Promise<void> {
    await this.service.setSkillsEnabled(body.enabled)
  }

  @Post('timeout')
  async timeout (): Promise<void> {
    await this.service.startStopTimeout()
  }
}
