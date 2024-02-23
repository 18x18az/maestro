import { Injectable, Logger } from '@nestjs/common'
import { TeamCreate } from './team.object'
import { TeamRepo } from './team.repo'
import { EventResetEvent } from '../stage/event-reset.event'
import { TeamEntity } from './team.entity'

@Injectable()
export class TeamService {
  private readonly logger = new Logger(TeamService.name)

  constructor (
    private readonly repo: TeamRepo,
    private readonly resetEvent: EventResetEvent
  ) {}

  onModuleInit (): void {
    this.resetEvent.registerBefore(this.repo.reset.bind(this.repo))
  }

  async getTeams (): Promise<TeamEntity[]> {
    return await this.repo.getTeams()
  }

  async addTeams (teams: TeamCreate[]): Promise<TeamEntity[]> {
    return await this.repo.addTeams(teams)
  }

  async getTeamByNumber (number: string): Promise<TeamEntity> {
    return await this.repo.getTeamByNumber(number)
  }

  async getTeam (id: number): Promise<TeamEntity> {
    return await this.repo.getTeam(id)
  }
}
