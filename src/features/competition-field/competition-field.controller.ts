import { Body, Controller, Param, Post } from '@nestjs/common'
import { CompetitionFieldService } from './competition-field.service'

@Controller('competitionField')
export class CompetitionFieldController {
  constructor (private readonly service: CompetitionFieldService) {}

  @Post(':fieldId/queue')
  async queueField (@Param('fieldId') fieldId: number, @Body() body: { matchId: number }): Promise<void> {
    await this.service.queueMatch(fieldId, body.matchId)
  }
}
