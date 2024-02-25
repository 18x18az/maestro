import { Injectable, Logger } from '@nestjs/common'
import { TeamRepo } from './team.repo'
import { TeamEntity } from './team.entity'
import { Inspection } from './team.interface'
import { TeamListUpdateContext, TeamListUpdateEvent } from './team-list-update.event'
import { InspectionService } from '../inspection/inspection.service'

@Injectable()
export class CheckinService {
  private readonly logger = new Logger(CheckinService.name)

  constructor (
    private readonly repo: TeamRepo,
    private readonly teamListUpdate: TeamListUpdateEvent,
    private readonly inspection: InspectionService
  ) { }

  onModuleInit (): void {
    this.teamListUpdate.registerAfter(this.onTeamListUpdate.bind(this))
  }

  async onTeamListUpdate (data: TeamListUpdateContext): Promise<void> {
    if (data.teamsToRemove.length > 0) {
      this.logger.log(`Removing ${data.teamsToRemove.length} teams`)
      for (const team of data.teamsToRemove) {
        // Intentionally only removing from the database because the handler function would also make a request to TM
        // which would throw an error because the team is no longer in TM
        await this.repo.markCheckinStatus(team.id, Inspection.NO_SHOW)
      }
    }
  }

  async markCheckinStatus (teamId: number, status: Inspection): Promise<TeamEntity> {
    this.logger.log(`Marking team ${teamId} as ${status}`)
    const team = await this.repo.markCheckinStatus(teamId, status)

    return team
  }

  async getInspectionSummary (id: number): Promise<Inspection> {
    const team = await this.repo.getTeam(id)
    const checkin = team.checkin
    if (checkin === Inspection.NOT_HERE || checkin === Inspection.NO_SHOW) {
      return checkin
    }

    return this.inspection.getInspectionSummary(id)
  }
}
