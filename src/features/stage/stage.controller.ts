import { TeamInformation, TeamsTopic } from '@/utils'
import { Controller } from '@nestjs/common'
import { EventPattern } from '@nestjs/microservices'
import { StageInternal } from './stage.internal'

@Controller('stage')
export class StageController {
  constructor (
    private readonly service: StageInternal
  ) {}

  @EventPattern(TeamsTopic)
  async handleTeams (body: { teams: TeamInformation[] }): Promise<void> {
    await this.service.receivedTeams(body.teams)
  }
}
