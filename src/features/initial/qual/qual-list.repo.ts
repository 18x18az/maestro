import { Injectable } from '@nestjs/common'
import { PersistentRepo } from './persistent.repo'
import { WorkingRepo } from './working.repo'

@Injectable()
export class QualListRepo {
  constructor (private readonly persistent: PersistentRepo, private readonly working: WorkingRepo) {}

  async hydrateQuals (): Promise<boolean> {
    const quals = await this.persistent.getMatches()
    if (quals.length === 0) {
      return false
    }
    this.working.hydrateQuals(quals)

    const existingBlockIds = await this.persistent.getMatchBlockIds()
    const existingBlocks = existingBlockIds.map(async id => await this.persistent.getBlock(id))

    console.log(existingBlocks)

    return true
  }
}
