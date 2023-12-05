import { TeamInformation } from '@/utils'
import { Controller, Post } from '@nestjs/common'
import { EventPattern } from '@nestjs/microservices'
import { StageInternal } from './stage.internal'

@Controller('stage')
export class StageController {
  constructor (
    private readonly service: StageInternal
  ) {}

  @EventPattern('teams')
  async handleTeams (body: { teams: TeamInformation[] }): Promise<void> {
    await this.service.receivedTeams(body.teams)
  }

  @EventPattern('matchlist')
  async handleQuals (): Promise<void> {
    await this.service.receivedMatches()
  }

  @Post('reset')
  async reset (): Promise<void> {
    await this.service.reset()
  }
}
