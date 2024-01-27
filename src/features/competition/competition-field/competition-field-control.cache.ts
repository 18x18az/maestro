import { BadRequestException, Injectable } from '@nestjs/common'
import { MATCH_STAGE } from './competition-field.interface'
import { CompetitionFieldRepo } from './competition-field.repo'
import { SittingStatus } from '../match/match.interface'

@Injectable()
export class CompetitionFieldControlCache {
  private readonly cache: Map<number, MATCH_STAGE> = new Map()

  constructor (private readonly repo: CompetitionFieldRepo) {}

  public async get (fieldId: number): Promise<MATCH_STAGE> {
    const cached = this.cache.get(fieldId)
    if (cached === undefined) {
      const onField = await this.repo.getOnFieldSitting(fieldId)
      const status = onField === null ? null : onField.status

      let result = MATCH_STAGE.EMPTY
      if (status === SittingStatus.QUEUED) {
        result = MATCH_STAGE.QUEUED
      } else if (status === SittingStatus.SCORING) {
        result = MATCH_STAGE.SCORING
      }

      this.set(fieldId, result)
      return result
    }
    return cached
  }

  set (fieldId: number, stage: MATCH_STAGE): void {
    this.cache.set(fieldId, stage)
  }

  remove (fieldId: number): void {
    // Cannot remove a field that is not in the cache
    const cached = this.cache.get(fieldId)
    if (cached === undefined) {
      throw new BadRequestException(`field ${fieldId} not in cache`)
    }

    // Cannot remove a field that is in the middle of a match
    if (cached === MATCH_STAGE.AUTON || cached === MATCH_STAGE.DRIVER) {
      throw new BadRequestException(`field ${fieldId} is in a match`)
    }

    // Remove the field from the cache
    this.cache.delete(fieldId)
  }
}
