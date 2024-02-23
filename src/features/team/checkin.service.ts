import { Injectable, Logger } from '@nestjs/common'
import { TmService } from '../../utils/tm/tm.service'
import { TeamRepo } from './team.repo'
import { TeamEntity } from './team.entity'
import { Inspection } from './team.interface'
import { TeamListUpdateContext, TeamListUpdateEvent } from './team-list-update.event'
import { TmConnectedEvent } from '../../utils/tm/tm-connected.event'
import { InspectionService } from '../inspection/inspection.service'

@Injectable()
export class CheckinService {
  private readonly logger = new Logger(CheckinService.name)

  constructor (
    private readonly tm: TmService,
    private readonly repo: TeamRepo,
    private readonly teamListUpdate: TeamListUpdateEvent,
    private readonly tmConnected: TmConnectedEvent,
    private readonly teamRepo: TeamRepo,
    private readonly inspection: InspectionService
  ) { }

  onModuleInit (): void {
    this.teamListUpdate.registerAfter(this.onTeamListUpdate.bind(this))
    this.tmConnected.registerOnComplete(this.reconcileCheckins.bind(this))
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

  async reconcileCheckins (): Promise<void> {
    const remoteStatuses = await this.tm.getCheckinStatuses()

    const promises = remoteStatuses.map(async (remote) => {
      const team = await this.teamRepo.getTeamByNumber(remote.team)
      const stored = team.checkin === Inspection.CHECKED_IN

      if (stored !== remote.status) {
        this.logger.log(`Updating ${remote.team} to ${remote.status ? 'checked in' : 'not checked in'}`)
        await this.tm.submitCheckin(remote.team, stored)
      }
    })

    await Promise.all(promises)
  }

  async markCheckinStatus (teamId: number, status: Inspection): Promise<TeamEntity> {
    this.logger.log(`Marking team ${teamId} as ${status}`)
    const team = await this.repo.markCheckinStatus(teamId, status)

    await this.tm.submitCheckin(team.number, status === Inspection.CHECKED_IN)

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
