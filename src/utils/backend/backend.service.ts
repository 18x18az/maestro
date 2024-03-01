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
import { StageChangeEvent } from '../../features/stage/stage-change.event'
import { EventStage } from '../../features/stage/stage.interface'
import { StageService } from '../../features/stage/stage.service'
import { QueueSittingEvent } from '../../features/competition/competition-field/queue-sitting.event'
import { AutonStartEvent } from '../../features/competition/competition-field/auton-start.event'
import { DriverEndEvent } from '../../features/competition/competition-field/driver-end.event'
import { RemoveOnFieldSittingEvent } from '../../features/competition/competition-field/remove-on-field-sitting.event'
import { RemoveOnTableSittingEvent } from '../../features/competition/competition-field/remove-on-table-sitting.event'
import { CompetitionFieldService } from '../../features/competition/competition-field/competition-field.service'
import { FieldService } from '../../features/field/field.service'
import { MatchService } from '../../features/competition/match/match.service'
import { Round, SittingStatus } from '../../features/competition/match/match.interface'

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

const updateStage = gql`
mutation($stage: EventStage!) {
  setStage(stage: $stage) {
    stage
  }
}
`

interface TeamInput {
  number: string
}

interface SittingInput {
  id: number
  sitting: number
  match: number
  contest: number
  field: string
  status: SittingStatusShort
  Round: Round
  red: number[]
  blue: number[]
}

enum SittingStatusShort {
  UPCOMING = 'UPCOMING',
  IN_PROGRESS = 'IN_PROGRESS',
  SCORING = 'SCORING'
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
    stageUpdate: StageChangeEvent,
    private readonly stage: StageService,
    private readonly checkin: CheckinService,
    private readonly teams: TeamService,
    queueEvent: QueueSittingEvent,
    autoStart: AutonStartEvent,
    driverEnd: DriverEndEvent,
    removeOnField: RemoveOnFieldSittingEvent,
    removeOnTable: RemoveOnTableSittingEvent,
    private readonly competitionFieldService: CompetitionFieldService,
    private readonly fields: FieldService,
    private readonly matches: MatchService
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
    stageUpdate.registerOnComplete(async (stage) => {
      await this.updateStage(stage.stage)
    })
    queueEvent.registerOnComplete(async () => {
      await this.updateMatchesOnFields()
    })
    autoStart.registerOnComplete(async () => {
      await this.updateMatchesOnFields()
    })
    driverEnd.registerOnComplete(async () => {
      await this.updateMatchesOnFields()
    })
    removeOnField.registerOnComplete(async () => {
      await this.updateMatchesOnFields()
    })
    removeOnTable.registerOnComplete(async () => {
      await this.updateMatchesOnFields()
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
        return
      }
    }

    const stage = await this.stage.getStage()
    await this.updateStage(stage)
    await this.updateMatchesOnFields()
  }

  async uploadAll (): Promise<void> {
    if (this.client === undefined) {
      return
    }

    const teams = await this.teams.getTeams()
    await this.createTeams(teams.map(t => ({ number: t.number })))
    const stage = await this.stage.getStage()
    await this.updateStage(stage)
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

    void this.uploadAll()

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

  async updateStage (stage: EventStage): Promise<void> {
    await this.request(updateStage, { stage })
  }

  private async getSittingInfo (sittingId: number, field: string): Promise<SittingInput> {
    const sitting = await this.matches.getSitting(sittingId)
    let status = SittingStatusShort.UPCOMING

    const match = await this.matches.getMatch(sitting.matchId)

    if (match === null) throw new Error('Match disappeared')

    const contest = await this.matches.getContestWithTeams(match.contestId)

    if (sitting.status === SittingStatus.SCORING) {
      status = SittingStatusShort.SCORING
    }

    const red = contest.redTeams.map(t => t.id)
    const blue = contest.blueTeams.map(t => t.id)

    return {
      id: sittingId,
      sitting: sitting.number,
      field,
      status,
      match: match.number,
      contest: contest.number,
      Round: contest.round,
      red,
      blue
    }
  }

  async updateMatchesOnFields (): Promise<void> {
    const compFields = await this.competitionFieldService.getStatus()
    const sittings: SittingInput[] = []

    for (const compField of compFields) {
      const fieldInfo = await this.fields.getField(compField.fieldId)

      if (compField.onFieldSittingId !== null) {
        const sitting = await this.getSittingInfo(compField.onFieldSittingId, fieldInfo.name)
        sittings.push(sitting)
      }
      if (compField.onTableSittingId !== null) {
        const sitting = await this.getSittingInfo(compField.onTableSittingId, fieldInfo.name)
        sittings.push(sitting)
      }
    }

    console.log(sittings)
  }
}
