import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { TeamModel } from './models/team.model'
import { OverallModel } from './models/overall.model'
import { InspectionPublisher } from './inspection.publisher'
import { InspectionChecklist, InspectionSummary } from '../../../interfaces/inspection'
import { EVENT_STAGE } from '../../stage/stage.interface'
import { INSPECTION_STAGE } from './inspection.interface'

@Injectable()
export class InspectionService {
  private readonly logger = new Logger(InspectionService.name)
  private canConclude: boolean = false
  private eventStage: EVENT_STAGE

  constructor (
    private readonly publisher: InspectionPublisher,
    private readonly teamModel: TeamModel,
    private readonly overallModel: OverallModel
  ) { }

  async loadTeams (teams: string[]): Promise<void> {
    await Promise.all(teams.map(async (team) => {
      const stage = await this.teamModel.initialLoad(team)
      await this.publisher.publishTeam(team, stage)
    }))
    const allStages = Object.values(INSPECTION_STAGE)

    await Promise.all(allStages.map(async (stage) => {
      await this.publishStage(stage as INSPECTION_STAGE)
    }))
    await this.evaluateCanConclude()
    this.logger.log('Inspection loaded')
  }

  private async publishStage (stage: INSPECTION_STAGE): Promise<void> {
    const list = this.overallModel.getTeamsByStage(stage)
    await this.publisher.publishStage(stage, list)
  }

  async markCheckinStage (team: string, stage: INSPECTION_STAGE): Promise<void> {
    if (this.eventStage !== EVENT_STAGE.CHECKIN) {
      throw new HttpException('Check in closed', HttpStatus.BAD_REQUEST)
    }

    const previous = this.teamModel.getStage(team)
    const newStage = await this.teamModel.markCheckinStage(team, stage)
    await this.handleChange(team, previous, newStage)
  }

  async markMetOrNot (team: string, criteria: number, isMet: boolean): Promise<void> {
    const previous = this.teamModel.getStage(team)

    if (previous === INSPECTION_STAGE.NO_SHOW || previous === INSPECTION_STAGE.NOT_HERE) {
      throw new HttpException('Team not checked in', HttpStatus.BAD_REQUEST)
    }

    const newStage = await this.teamModel.markInspectionCheckbox(team, criteria, isMet)

    await this.handleChange(team, previous, newStage)
  }

  private async evaluateCanConclude (): Promise<void> {
    const canConclude = this.overallModel.getTeamsByStage(INSPECTION_STAGE.NOT_HERE).length === 0
    if (canConclude !== this.canConclude) {
      if (this.eventStage === EVENT_STAGE.CHECKIN) {
        this.logger.log(`Check in can conclude: ${canConclude.toString()}`)
        this.canConclude = canConclude
        await this.publisher.publishCanConclude(canConclude)
      }
    }
  }

  async getChecklist (): Promise<InspectionChecklist> {
    return await this.overallModel.getInspectionChecklist()
  }

  async setEventStage (stage: EVENT_STAGE): Promise<void> {
    this.eventStage = stage

    if (this.eventStage !== EVENT_STAGE.CHECKIN) {
      this.canConclude = false
      await this.publisher.publishCanConclude(false)
    }
  }

  private async handleChange (team: string, prev: INSPECTION_STAGE, now: INSPECTION_STAGE): Promise<void> {
    if (prev !== now) {
      this.logger.log(`Team ${team} changed from ${prev as string} to ${now as string}`)
      await Promise.all([
        await this.publisher.publishTeam(team, now),
        await this.publishStage(prev),
        await this.publishStage(now)
      ])

      if (prev === INSPECTION_STAGE.NOT_HERE || now === INSPECTION_STAGE.NOT_HERE) {
        await this.evaluateCanConclude()
      }
    }
  }

  async getTeamProgress (team: string): Promise<InspectionSummary> {
    const currentStatus = this.teamModel.getStage(team)
    if (currentStatus === INSPECTION_STAGE.NOT_HERE || currentStatus === INSPECTION_STAGE.NO_SHOW) {
      throw new HttpException('Team not checked in', HttpStatus.BAD_REQUEST)
    }

    const criteria = await this.getChecklist()
    const met = await this.teamModel.getCriteriaMet(team)
    return Object.entries(criteria).map(([group, criteria]) => {
      return {
        title: group,
        criteria: criteria.map(criterion => {
          return {
            text: criterion.text,
            met: met.includes(criterion.uuid),
            uuid: criterion.uuid
          }
        })
      }
    })
  }
}
