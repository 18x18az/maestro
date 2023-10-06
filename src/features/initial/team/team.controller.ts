import { Body, Controller, Post } from '@nestjs/common'
import { Team } from './team.interface'
import { TeamService } from './team.service'

@Controller('teams')
export class TeamController {
  constructor (private readonly teamService: TeamService) {}

  @Post('')
  async createTeam (@Body() teams: Team[]): Promise<void> {
    await this.teamService.createTeams(teams)
  }
}