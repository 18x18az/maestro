import { TeamInformation, TeamsTopic } from '@/utils'
import { Controller, Post } from '@nestjs/common'
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

  @EventPattern('quals')
  async handleQuals (): Promise<void> {
    await this.service.receivedQuals()
  }

  @Post('reset')
  async reset (): Promise<void> {
    await this.service.reset()
  }
}
