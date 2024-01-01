import { Injectable, Logger } from '@nestjs/common'
import { Team, TeamCreate } from './team.object'
import { TeamRepo } from './team.repo'
import { Checkin } from './team.interface'
import { EventResetEvent } from '../stage/event-reset.event'

@Injectable()
export class TeamService {
  private readonly logger = new Logger(TeamService.name)

  constructor (private readonly repo: TeamRepo, private readonly resetEvent: EventResetEvent) {}

  onModuleInit (): void {
    this.resetEvent.registerBefore(this.repo.reset.bind(this.repo))
  }

  // async updateTeam (teamId: number, update: any): Promise<Team> {
  //   return { id: teamId, number: '1234', checkin: Checkin.NOT_HERE }
  // }

  async createTeams (teams: TeamCreate[]): Promise<Team[]> {
    const existingTeams = await this.repo.getTeams()
    const teamsToRemove = existingTeams.filter(team => teams.find(t => t.number === team.number) === undefined)
    const teamsToAdd = teams.filter(team => existingTeams.find(t => t.number === team.number) === undefined)

    if (teamsToRemove.length === 0 && teamsToAdd.length === 0) return existingTeams

    if (teamsToRemove.length > 0) {
      this.logger.log(`Removing ${teamsToRemove.length} teams`)
      for (const team of teamsToRemove) {
        await this.repo.markCheckinStatus(team.id, Checkin.NO_SHOW)
      }
    }

    if (teamsToAdd.length > 0) {
      this.logger.log(`Adding ${teamsToAdd.length} teams`)
      await this.repo.addTeams(teamsToAdd)
    }

    return await this.repo.getTeams()
  }
}
