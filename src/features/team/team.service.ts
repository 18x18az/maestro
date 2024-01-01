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

  async getTeams (): Promise<Team[]> {
    return await this.repo.getTeams()
  }

  async markCheckinStatus (teamId: number, status: Checkin): Promise<Team> {
    return await this.repo.markCheckinStatus(teamId, status)
  }

  async addTeams (teams: TeamCreate[]): Promise<Team[]> {
    return await this.repo.addTeams(teams)
  }
}
