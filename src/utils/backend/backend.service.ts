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
import { QueueSittingEvent, QueueSittingResult } from '../../features/competition/competition-field/queue-sitting.event'
import { AutonStartEvent, AutonStartPayload } from '../../features/competition/competition-field/auton-start.event'
import { DriverEndEvent, DriverEndResult } from '../../features/competition/competition-field/driver-end.event'
import { RemoveOnFieldSittingContext, RemoveOnFieldSittingEvent } from '../../features/competition/competition-field/remove-on-field-sitting.event'
import { RemoveOnTableSittingContext, RemoveOnTableSittingEvent } from '../../features/competition/competition-field/remove-on-table-sitting.event'
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

const setSittings = gql`
mutation($sittings: [SittingInput!]!) {
  setSittings(sittings: $sittings) {
    id
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
  round: Round
  red: string[]
  blue: string[]
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

  private inProgressField: number | null = null

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
    queueEvent.registerOnComplete(async (data: QueueSittingResult) => {
      await this.updateMatchesOnFields()
    })
    autoStart.registerOnComplete(async (data: AutonStartPayload) => {
      this.inProgressField = data.fieldId
      await this.updateMatchesOnFields()
    })
    driverEnd.registerOnComplete(async (data: DriverEndResult) => {
      this.inProgressField = null
      await this.updateMatchesOnFields()
    })
    removeOnField.registerOnComplete(async (data: RemoveOnFieldSittingContext) => {
      await this.updateMatchesOnFields()
    })
    removeOnTable.registerOnComplete(async (data: RemoveOnTableSittingContext) => {
      await this.updateMatchesOnFields()
    })
  }

  async initialConnection (): Promise<BackendStatus> {
    this.logger.log('Attempting to connect to backend')
    const authorization = await this.storage.getPersistent('backend.password', '')
    const url = this.url

    if (url === undefined) return BackendStatus.NOT_CONFIGURED

    if (authorization === '') return BackendStatus.AUTH_ERROR

    this.client = new GraphQLClient(url.href, {
      headers: {
        authorization
      }
    })

    this.logger.log('Attempting to connect to backend')
    const result = await this.tryConnection()
    if (result === BackendStatus.CONNECTED) {
      this.logger.log('Backend connection established')
    } else {
      this.logger.warn('Backend connection failed')
      this.url = undefined
      return BackendStatus.NOT_CONFIGURED
    }

    const stage = await this.stage.getStage()
    await this.updateStage(stage)
    await this.updateMatchesOnFields()
    return BackendStatus.CONNECTED
  }

  async onApplicationBootstrap (): Promise<void> {
    const url = await this.storage.getPersistent('backend.url', '')

    if (url === '') {
      this.logger.warn('Backend URL not set')
      return
    }

    this.url = new URL(url)

    void this.initialConnection()
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

    try {
      const response = await this.client.request(document, variables)
      return response
    } catch (error: any) {
      this.logger.warn('Request failed', error)
      return false
    }
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

  private async getSittingInfo (sittingId: number, field: string, inProgress: boolean): Promise<SittingInput> {
    const sitting = await this.matches.getSitting(sittingId)
    let status = SittingStatusShort.UPCOMING

    const match = await this.matches.getMatch(sitting.matchId)

    if (match === null) throw new Error('Match disappeared')

    const contest = await this.matches.getContestWithTeams(match.contestId)

    if (sitting.status === SittingStatus.SCORING) {
      status = SittingStatusShort.SCORING
    }

    if (inProgress) {
      status = SittingStatusShort.IN_PROGRESS
    }

    const red = contest.redTeams.map(t => t.number)
    const blue = contest.blueTeams.map(t => t.number)

    return {
      id: sittingId,
      sitting: sitting.number,
      field,
      status,
      match: match.number,
      contest: contest.number,
      round: contest.round,
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
        const isInProgress = this.inProgressField === compField.fieldId
        const sitting = await this.getSittingInfo(compField.onFieldSittingId, fieldInfo.name, isInProgress)
        sittings.push(sitting)
      }
      if (compField.onTableSittingId !== null) {
        const sitting = await this.getSittingInfo(compField.onTableSittingId, fieldInfo.name, false)
        sittings.push(sitting)
      }
    }

    sittings.sort((a, b) => a.id - b.id)

    await this.request(setSittings, { sittings })
  }
}
