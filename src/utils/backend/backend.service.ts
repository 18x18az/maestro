import { Injectable, Logger } from '@nestjs/common'
import { StorageService } from '../storage'
import { BackendStatus } from './backend.interface'
import { request, gql } from 'graphql-request'
import { TeamListUpdateContext, TeamListUpdateEvent } from '../../features/team/team-list-update.event'
import { Inspection } from '../../features/team/team.interface'
import { CheckinUpdateEvent } from '../../features/team/checkin-update.event'
import { CheckinService } from '../../features/team/checkin.service'
import { TeamService } from '../../features/team/team.service'

const status = gql`
{
  connection {
    status
  }
}
`

const createTeams = gql`
mutation($teams: [CreateTeamInput!]!) {
  createTeams(teams: $teams) {
    number
  }
}
`

const updateCheckin = gql`
mutation($team: String!, $checkin: Inspection!) {
  updateCheckin(team: $team, checkin: $checkin) {
    number
  }
}
`

interface Connection {
  connection: {
    status: string
  }
}

interface TeamInput {
  number: string
}

@Injectable()
export class BackendService {
  private readonly logger = new Logger(BackendService.name)
  private url: URL | undefined
  private status: BackendStatus = BackendStatus.NOT_CONFIGURED

  constructor (
    private readonly storage: StorageService,
    teamListUpdate: TeamListUpdateEvent,
    checkinUpdate: CheckinUpdateEvent,
    private readonly checkin: CheckinService,
    private readonly teams: TeamService
  ) {
    teamListUpdate.registerOnComplete(async (context: TeamListUpdateContext) => {
      await this.createTeams(context.teams.map(t => ({ number: t.number })))
    })
    checkinUpdate.registerOnComplete(async (result) => {
      await this.updateCheckin(result.teamEntity.number, result.status)
    })
  }

  async onApplicationBootstrap (): Promise<void> {
    const url = await this.storage.getPersistent('backend.url', '')
    if (url !== '') {
      this.url = new URL(url)
      const result = await this.tryConnection()
      if (result === BackendStatus.CONNECTED) {
        this.logger.log('Backend connection established')
      } else {
        this.logger.warn('Backend connection failed')
        this.url = undefined
      }
    }
  }

  getUrl (): URL | undefined {
    return this.url
  }

  getStatus (): BackendStatus {
    return this.status
  }

  async setConfig (url: URL): Promise<BackendStatus> {
    this.url = url
    const result = await this.tryConnection()
    if (result === BackendStatus.CONNECTED) {
      await this.storage.setPersistent('backend.url', url.href)
      this.logger.log('Backend connection established')
      return BackendStatus.CONNECTED
    } else {
      this.url = undefined
      return BackendStatus.NOT_CONFIGURED
    }
  }

  private async tryConnection (): Promise<BackendStatus> {
    try {
      const result = await this.request(status) as Connection

      if (result.connection.status === 'REGULAR') {
        this.status = BackendStatus.CONNECTED
        return BackendStatus.CONNECTED
      }
    } catch (error: any) {
      this.logger.warn('Connection failed', error.message)
    }

    this.status = BackendStatus.NOT_CONFIGURED
    return BackendStatus.NOT_CONFIGURED
  }

  private async request (document: string, variables?: any): Promise<unknown> {
    if (this.url === undefined) {
      return
    }

    const response = await request(this.url.href, document, variables)
    return response
  }

  async createTeams (teams: TeamInput[]): Promise<void> {
    this.logger.log('Uploading team list')
    await this.request(createTeams, { teams })

    const checkinPromises = teams.map(async (team) => {
      const teamEntity = await this.teams.getTeamByNumber(team.number)
      const checkin = await this.checkin.getInspectionSummary(teamEntity.id)
      await this.updateCheckin(team.number, checkin)
    })

    await Promise.all(checkinPromises)
  }

  async updateCheckin (team: string, checkin: Inspection): Promise<void> {
    this.logger.log(`Updating checkin for team ${team}`)
    await this.request(updateCheckin, { team, checkin })
  }
}
