import { Injectable, Logger } from '@nestjs/common'
import { StorageService } from '../storage'
import { BackendStatus } from './backend.interface'
import { gql, GraphQLClient } from 'graphql-request'
import { TeamListUpdateContext, TeamListUpdateEvent } from '../../features/team/team-list-update.event'
import { Inspection } from '../../features/team/team.interface'
import { CheckinUpdateEvent } from '../../features/team/checkin-update.event'
import { CheckinService } from '../../features/team/checkin.service'
import { TeamService } from '../../features/team/team.service'
import { InspectionUpdateEvent } from '../../features/inspection/inspection-update.event'

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

const updateInspection = gql`
mutation($team: String!, $inspection: Inspection!) {
  updateInspection(team: $team, inspection: $inspection) {
    number
  }
}
`

interface TeamInput {
  number: string
}

@Injectable()
export class BackendService {
  private readonly logger = new Logger(BackendService.name)
  private url: URL | undefined
  private status: BackendStatus = BackendStatus.NOT_CONFIGURED
  private client: GraphQLClient | undefined

  constructor (
    private readonly storage: StorageService,
    teamListUpdate: TeamListUpdateEvent,
    checkinUpdate: CheckinUpdateEvent,
    inspectionUpdate: InspectionUpdateEvent,
    private readonly checkin: CheckinService,
    private readonly teams: TeamService
  ) {
    teamListUpdate.registerOnComplete(async (context: TeamListUpdateContext) => {
      await this.createTeams(context.teams.map(t => ({ number: t.number })))
    })
    checkinUpdate.registerOnComplete(async (result) => {
      await this.updateInspection(result.teamEntity.number, result.status)
    })
    inspectionUpdate.registerOnComplete(async (result) => {
      if (result.initial === result.updated) return
      const team = await this.teams.getTeam(result.teamId)

      await this.updateInspection(team.number, result.updated)
    })
  }

  async onApplicationBootstrap (): Promise<void> {
    const url = await this.storage.getPersistent('backend.url', '')
    const authorization = await this.storage.getPersistent('backend.password', '')

    if (url !== '' && authorization !== '') {
      this.url = new URL(url)
      this.client = new GraphQLClient(this.url.href, {
        headers: {
          authorization
        }
      })
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

  makeClient (password: string): void {
    if (this.url === undefined) {
      throw new Error('Backend URL not set')
    }

    this.client = new GraphQLClient(this.url.href, {
      headers: {
        authorization: password
      }
    })
  }

  async setConfig (url: URL, password: string): Promise<BackendStatus> {
    this.url = url
    this.makeClient(password)
    const result = await this.tryConnection()
    if (result === BackendStatus.CONNECTED) {
      await this.storage.setPersistent('backend.url', url.href)
      await this.storage.setPersistent('backend.password', password)
      this.logger.log('Backend connection established')
    }

    return result
  }

  private async tryConnection (): Promise<BackendStatus> {
    try {
      await this.request(status)
      return BackendStatus.CONNECTED
    } catch (error: any) {
      this.client = undefined
      const message = String(error.message)
      if (message.includes('Forbidden')) {
        this.logger.warn('Authorization failed')
        return BackendStatus.AUTH_ERROR
      }
      this.logger.warn('Connection failed', message)
    }

    this.status = BackendStatus.NOT_CONFIGURED
    return BackendStatus.NOT_CONFIGURED
  }

  private async request (document: string, variables?: any): Promise<unknown> {
    if (this.client === undefined) {
      return
    }

    const response = await this.client.request(document, variables)
    return response
  }

  async createTeams (teams: TeamInput[]): Promise<void> {
    this.logger.log('Uploading team list')
    await this.request(createTeams, { teams })

    const checkinPromises = teams.map(async (team) => {
      const teamEntity = await this.teams.getTeamByNumber(team.number)
      const inspection = await this.checkin.getInspectionSummary(teamEntity.id)
      await this.updateInspection(team.number, inspection)
    })

    await Promise.all(checkinPromises)
  }

  async updateInspection (team: string, inspection: Inspection): Promise<void> {
    await this.request(updateInspection, { team, inspection })
  }
}
