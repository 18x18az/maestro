import { Injectable } from '@nestjs/common'
import { EventService } from '../../utils/classes/event-service'
import { Checkin } from './team.interface'
import { Team, TeamCreate } from './team.object'
import { TeamService } from './team.service'

export interface TeamListUpdatePayload {
  teams: TeamCreate[]
}

export interface TeamListUpdateContext extends TeamListUpdatePayload {
  teamsToAdd: TeamCreate[]
  teamsToRemove: Team[]
}

@Injectable()
export class TeamListUpdateEvent extends EventService<TeamListUpdatePayload, TeamListUpdateContext, TeamListUpdateContext> {
  constructor (private readonly service: TeamService) { super() }

  protected async getContext (data: TeamListUpdatePayload): Promise<TeamListUpdateContext> {
    const existingTeams = await this.service.getTeams()
    const updatedTeams = data.teams
    const teamsToRemove = existingTeams.filter(team => updatedTeams.find(t => t.number === team.number) === undefined)
    const teamsToAdd = updatedTeams.filter(team => existingTeams.find(t => t.number === team.number) === undefined)

    return {
      teams: data.teams,
      teamsToAdd,
      teamsToRemove
    }
  }

  protected async doExecute (data: TeamListUpdateContext): Promise<TeamListUpdateContext> {
    if (data.teamsToRemove.length === 0 && data.teamsToAdd.length === 0) return data

    if (data.teamsToRemove.length > 0) {
      this.logger.log(`Removing ${data.teamsToRemove.length} teams`)
      for (const team of data.teamsToRemove) {
        await this.service.markCheckinStatus(team.id, Checkin.NO_SHOW)
      }
    }

    if (data.teamsToAdd.length > 0) {
      this.logger.log(`Adding ${data.teamsToAdd.length} teams`)
      await this.service.addTeams(data.teamsToAdd)
    }

    return data
  }
}
