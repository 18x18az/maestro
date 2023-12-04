import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { CompetitionControlCache } from './competition-control.cache'
import { CompetitionFieldService } from '../competition-field/competition-field.service'
import { MATCH_STAGE } from '../competition-field/competition-field.interface'

@Injectable()
export class CompetitionControlService {
  private readonly logger = new Logger(CompetitionControlService.name)
  constructor (
    private readonly cache: CompetitionControlCache,
    private readonly fields: CompetitionFieldService
  ) { }

  async markFieldAsOnDeck (fieldId: number): Promise<void> {
    this.logger.log(`Marking field ${fieldId} as on deck`)
    await this.fields.readyAutonomous(fieldId)
    await this.cache.setOnDeckField(fieldId)
  }

  async makeOnDeckFieldCurrent (): Promise<void> {
    const fieldId = this.cache.getOnDeckField()
    if (fieldId === null) {
      this.logger.warn('No field is on deck')
      throw new BadRequestException('No field is on deck')
    }

    // If there is a match on the field, ensure it's not an active match
    const currentField = this.cache.getCurrentField()
    if (currentField !== null) {
      await this.fields.noLongerActiveField(currentField)
    }

    await this.cache.setOnDeckField(null)
    await this.cache.setCurrentField(fieldId)
  }

  async startPeriod (): Promise<void> {
    const fieldId = this.cache.getCurrentField()
    if (fieldId === null) {
      this.logger.warn('No field is current')
      throw new BadRequestException('No field is current')
    }

    const stage = await this.fields.getOnFieldMatchStage(fieldId)

    if (stage === MATCH_STAGE.QUEUED) {
      await this.fields.startAutonomous(fieldId)
    } else if (stage === MATCH_STAGE.SCORING_AUTON) {
      await this.fields.startDriver(fieldId)
    } else {
      this.logger.warn(`Field ${fieldId} is not ready to start`)
      throw new BadRequestException(`Field ${fieldId} is not ready to start`)
    }
  }

  async reset (): Promise<void> {
    const fieldId = this.cache.getCurrentField()
    if (fieldId === null) {
      this.logger.warn('No field is current')
      throw new BadRequestException('No field is current')
    }

    await this.fields.readyAutonomous(fieldId)
  }

  async replayMatch (matchId: number): Promise<void> {
    await this.fields.replayMatch(matchId)
  }
}
