import { Injectable, Logger } from '@nestjs/common'
import { TmService } from '../../utils/tm/tm.service'
import { TeamRepo } from './team.repo'
import { TeamEntity } from './team.entity'
import { Checkin } from './team.interface'
import { TeamListUpdateContext, TeamListUpdateEvent } from './team-list-update.event'
import { TmConnectedEvent } from '../../utils/tm/tm-connected.event'

@Injectable()
export class CheckinService {
  private readonly logger = new Logger(CheckinService.name)

  constructor (
    private readonly tm: TmService,
    private readonly repo: TeamRepo,
    private readonly teamListUpdate: TeamListUpdateEvent,
    private readonly tmConnected: TmConnectedEvent,
    private readonly teamRepo: TeamRepo
  ) { }

  onModuleInit (): void {
    this.teamListUpdate.registerOnComplete(this.onTeamListUpdate.bind(this))
    this.tmConnected.registerOnComplete(this.reconcileCheckins.bind(this))
  }

  async onTeamListUpdate (data: TeamListUpdateContext): Promise<void> {
    if (data.teamsToRemove.length > 0) {
      this.logger.log(`Removing ${data.teamsToRemove.length} teams`)
      for (const team of data.teamsToRemove) {
        await this.markCheckinStatus(team.id, Checkin.NO_SHOW)
      }
    }
  }

  async reconcileCheckins (): Promise<void> {
    const remoteStatuses = await this.tm.getCheckinStatuses()

    const promises = remoteStatuses.map(async (remote) => {
      const team = await this.teamRepo.getTeamByNumber(remote.team)
      const stored = team.checkin === Checkin.CHECKED_IN

      if (stored !== remote.status) {
        this.logger.log(`Updating ${remote.team} to ${remote.status ? 'checked in' : 'not checked in'}`)
        await this.tm.submitCheckin(remote.team, stored)
      }
    })

    await Promise.all(promises)
  }

  async markCheckinStatus (teamId: number, status: Checkin): Promise<TeamEntity> {
    this.logger.log(`Marking team ${teamId} as ${status}`)
    const team = await this.repo.markCheckinStatus(teamId, status)

    await this.tm.submitCheckin(team.number, status === Checkin.CHECKED_IN)

    return team
  }
}
