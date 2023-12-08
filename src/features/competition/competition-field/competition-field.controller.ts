import { Body, Controller, Param, Post } from '@nestjs/common'
import { CompetitionFieldService } from './competition-field.service'
import { EventPattern } from '@nestjs/microservices'
import { LifecycleService } from './lifecyle.service'

@Controller('competitionField')
export class CompetitionFieldController {
  constructor (private readonly service: CompetitionFieldService, private readonly persistence: LifecycleService) {}

  @Post(':fieldId/queue')
  async queueField (@Param('fieldId') fieldId: number, @Body() body: { matchId: number }): Promise<void> {
    await this.service.queueMatch(fieldId, body.matchId)
  }

  @EventPattern('automation')
  async handleStage (body: { enabled: boolean }): Promise<void> {
    this.persistence.enableAutomation(body.enabled)
    await this.service.fillAllFields()
  }
}
