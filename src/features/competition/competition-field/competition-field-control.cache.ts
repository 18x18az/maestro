import { BadRequestException, Injectable } from '@nestjs/common'
import { MATCH_STAGE } from './competition-field.interface'

@Injectable()
export class CompetitionFieldControlCache {
  private readonly cache: Map<number, MATCH_STAGE> = new Map()

  public get (fieldId: number): MATCH_STAGE {
    const cached = this.cache.get(fieldId)
    if (cached === undefined) {
      this.set(fieldId, MATCH_STAGE.EMPTY)
      return MATCH_STAGE.EMPTY
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
