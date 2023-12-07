import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { CompetitionControlCache } from './competition.cache'
import { CompetitionFieldService } from '../competition-field/competition-field.service'
import { MATCH_STAGE } from '../competition-field/competition-field.interface'
import { MatchResult } from '../../../utils'
import { MatchService, MatchStatus } from '../match'

@Injectable()
export class CompetitionControlService {
  private readonly logger = new Logger(CompetitionControlService.name)
  constructor (
    private readonly cache: CompetitionControlCache,
    private readonly fields: CompetitionFieldService,
    private readonly matches: MatchService
  ) { }

  async markFieldAsOnDeck (fieldId: number): Promise<void> {
    this.logger.log(`Marking field ${fieldId} as on deck`)
    await this.cache.setOnDeckField(fieldId)
  }

  async readyAutonomous (): Promise<void> {
    this.logger.log('Readying autonomous period')

    const fieldId = this.cache.getLiveField()
    if (fieldId === null) {
      this.logger.warn('No live field')
      throw new BadRequestException('No live field')
    }

    await this.fields.readyAutonomous(fieldId)
  }

  async makeOnDeckFieldLive (): Promise<void> {
    const fieldId = this.cache.getOnDeckField()
    if (fieldId === null) {
      this.logger.warn('No field is on deck')
      throw new BadRequestException('No field is on deck')
    }

    // If there is a match on the field, ensure it's not an active match
    const currentField = this.cache.getLiveField()
    if (currentField !== null) {
      await this.fields.noLongerLiveField(currentField)
    }

    await this.cache.setOnDeckField(null)
    await this.cache.setLiveField(fieldId)
    await this.readyAutonomous()
    const nextOnDeck = await this.fields.getNextOnDeckField(fieldId)
    if (nextOnDeck !== null) {
      await this.markFieldAsOnDeck(nextOnDeck)
    }
  }

  async clearLiveField (): Promise<void> {
    this.logger.log('Clearing live field')
    const fieldId = this.cache.getLiveField()
    if (fieldId === null) {
      this.logger.warn('No field currently active')
      throw new BadRequestException('No field currently live')
    }

    await this.fields.noLongerLiveField(fieldId)
    await this.cache.setLiveField(null)
  }

  async onDriverEnd (): Promise<void> {
    setTimeout(() => {
      void this.clearLiveField()
    }, 3000)
  }

  async startPeriod (): Promise<void> {
    const fieldId = this.cache.getLiveField()
    if (fieldId === null) {
      this.logger.warn('No field is current')
      throw new BadRequestException('No field is current')
    }

    const stage = await this.fields.getMatchStage(fieldId)

    if (stage === MATCH_STAGE.QUEUED) {
      await this.fields.startAutonomous(fieldId)
    } else if (stage === MATCH_STAGE.SCORING_AUTON) {
      await this.fields.startDriver(fieldId, this.onDriverEnd.bind(this))
    } else {
      this.logger.warn(`Field ${fieldId} is not ready to start`)
      throw new BadRequestException(`Field ${fieldId} is not ready to start`)
    }
  }

  async stopEarly (): Promise<void> {
    this.logger.log('Ending period early')
    const fieldId = this.cache.getLiveField()
    if (fieldId === null) {
      this.logger.warn('No live field')
      throw new BadRequestException('No live field')
    }

    const stage = await this.fields.getMatchStage(fieldId)

    if (stage === MATCH_STAGE.AUTON) {
      await this.fields.endAutonomous(fieldId)
    } else if (stage === MATCH_STAGE.DRIVER) {
      await this.fields.endDriver(fieldId)
    } else {
      this.logger.warn(`Cannot end period early for stage ${stage}`)
      throw new BadRequestException(`Cannot end period early for stage ${stage}`)
    }
  }

  async replayMatch (matchId: number): Promise<void> {
    await this.fields.replayMatch(matchId)
  }

  async removeMatch (matchId: number): Promise<void> {
    await this.enableAutomation(false)
    await this.fields.removeMatch(matchId)
  }

  async enableAutomation (enabled: boolean): Promise<void> {
    await this.cache.setAutomationEnabled(enabled)
  }

  async handleMatchResult (result: MatchResult): Promise<void> {
    const match = await this.matches.findByIdent(result.identifier)
    if (match.status === MatchStatus.SCORING) {
      await this.fields.matchScored(match.id)
    }
  }
}
