import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { FieldService } from '../field/field.service'
import { FieldStatusService } from './field-status.service'
import { FieldControlRepo } from './field-control.repo'
import { MatchResult } from '@/utils'
import { MatchService, MatchStatus } from '../match'

@Injectable()
export class MatchManager {
  private readonly logger: Logger = new Logger(MatchManager.name)

  constructor (
    private readonly match: MatchService,
    private readonly fields: FieldService,
    private readonly status: FieldStatusService,
    private readonly repo: FieldControlRepo
  ) {}

  private async removeFromField (fieldId: number, matchId: number): Promise<void> {
    await this.fields.removeMatch(fieldId, matchId)
    await this.status.refresh(fieldId)
  }

  private async addToField (fieldId: number, matchId: number): Promise<void> {
    await this.fields.queueMatch(fieldId, matchId)
    await this.status.refresh(fieldId)
  }

  async remove (match: number): Promise<void> {
    this.logger.log(`Removing match ID ${match} from queue`)
    const fieldOnId = await this.repo.findMatchField(match)
    if (fieldOnId === null) {
      this.logger.warn(`Match ID ${match} not found on any field`)
      throw new BadRequestException(`Match ID ${match} not found on any field`)
    }

    await this.match.unmarkQueued(match)
    await this.removeFromField(fieldOnId, match)
  }

  async move (match: number, targetFieldId: number): Promise<void> {
    this.logger.log(`Moving match ID ${match} to field ID ${targetFieldId}`)
    const fieldOnId = await this.repo.findMatchField(match)
    if (fieldOnId === null) {
      this.logger.warn(`Match ID ${match} not found on any field`)
      throw new BadRequestException(`Match ID ${match} not found on any field`)
    }

    await this.removeFromField(fieldOnId, match)
    await this.addToField(targetFieldId, match)
  }

  async add (fieldId: number, match: number): Promise<void> {
    this.logger.log(`Queueing match ID ${match} on field ID ${fieldId}`)
    await this.addToField(fieldId, match)
    await this.match.markQueued(match)
  }

  async replay (match: number): Promise<void> {
    this.logger.log(`Replaying match ID ${match}`)

    await this.match.markForReplay(match)
    const fieldOnId = await this.repo.findMatchField(match)

    if (fieldOnId === null) {
      return
    }

    await this.removeFromField(fieldOnId, match)
  }

  async markPlayed (match: number): Promise<void> {
    this.logger.log(`Marking match ID ${match} as played`)
    await this.match.markPlayed(match)
  }

  async gotResults (results: MatchResult[]): Promise<void> {
    for (const result of results) {
      const match = await this.repo.findMatch(result.identifier)
      if (match === null) {
        throw new Error(`Match ${JSON.stringify(result.identifier)} not found`)
      }
      const status = match.status

      if (status === MatchStatus.COMPLETE) {
        continue
      }

      const fieldOnId = await this.repo.findMatchField(match.id)

      if (fieldOnId !== null) {
        await this.removeFromField(fieldOnId, match.id)
      }

      await this.match.markScored(match.id)
    }
  }
}
