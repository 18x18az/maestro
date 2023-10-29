import { Injectable } from '@nestjs/common'
import { PersistentRepo, RawBlock } from './persistent.repo'
import { WorkingRepo } from './working.repo'
import { MatchResolution, QualMatch, QualMatchBlockBroadcast, QualMatchSitting, QualScheduleBlockUpload, QualScheduleMatchUpload } from './qual-list.interface'
import { QueuedMatch } from '@/features'

@Injectable()
export class QualListRepo {
  constructor (private readonly persistent: PersistentRepo, private readonly working: WorkingRepo) {}

  private async hydrateBlock (block: RawBlock): Promise<void> {
    this.working.addBlock(block)
    const firstSittingId = await this.persistent.getFirstMatchId(block.id)
    if (firstSittingId === null) {
      return
    }

    let nextSittingId: number | null = firstSittingId
    do {
      const rawSitting = await this.persistent.getScheduledMatch(nextSittingId)
      const matchId = rawSitting.matchId
      const match = this.working.getMatch(matchId)
      const sittingNumber = this.working.getPreviousNumber(matchId)
      const sitting: QualMatchSitting = {
        field: rawSitting.fieldId, sittingId: rawSitting.id, sitting: sittingNumber, resolution: rawSitting.resolution, ...match
      }
      this.working.addMatchToBlock(block.id, sitting)
      nextSittingId = rawSitting.nextMatchId
    } while (nextSittingId !== null)
  }

  async hydrateQuals (): Promise<boolean> {
    const quals = await this.persistent.getMatches()
    if (quals === null) {
      return false
    }

    this.working.hydrateQuals(quals)

    const blocks = await this.persistent.getBlocks()
    for (const block of blocks) {
      await this.hydrateBlock(block)
    }

    return true
  }

  async createBlock (block: QualScheduleBlockUpload): Promise<number> {
    const blockId = this.persistent.createBlock(block)
    this.working.addBlock({ ...block, id: await blockId })
    return await blockId
  }

  getQuals (): QualMatch[] {
    return this.working.getQuals()
  }

  getBlocks (): QualMatchBlockBroadcast[] {
    return this.working.getBlocks()
  }

  getBlock (blockId: number): QualMatchBlockBroadcast {
    return this.working.getBlock(blockId)
  }

  getMatch (matchId: number): QualMatch {
    return this.working.getMatch(matchId)
  }

  async createMatch (match: QualScheduleMatchUpload): Promise<number> {
    const matchId = await this.persistent.createMatch(match)
    const fullMatch: QualMatch = {
      id: matchId,
      number: match.number,
      red: {
        team1: match.redAlliance.team1,
        team2: match.redAlliance.team2
      },
      blue: {
        team1: match.blueAlliance.team1,
        team2: match.blueAlliance.team2
      }
    }
    this.working.addQual(fullMatch)
    return matchId
  }

  async appendMatchToBlock (blockId: number, matchId: number, fieldId: number): Promise<void> {
    const block = this.getBlock(blockId)
    const match = this.getMatch(matchId)

    const previousNumber = this.working.getPreviousNumber(matchId)
    const previousId = this.working.getFinalMatchId(blockId)

    const sittingId = await this.persistent.createScheduledMatch(match, fieldId)

    const sitting: QualMatchSitting = {
      ...match, sittingId, sitting: previousNumber, resolution: MatchResolution.NOT_STARTED, field: fieldId
    }

    block.matches.push(sitting)
    if (previousId === null) {
      await this.persistent.addFirstMatch(blockId, sittingId)
    } else {
      await this.persistent.addMatchAfter(previousId, sittingId)
    }

    this.working.addMatchToBlock(blockId, sitting)
  }

  async markSittingResolution (match: QueuedMatch, resolution: MatchResolution): Promise<void> {
    await this.persistent.markSittingResolution(match.sittingId, resolution)
    this.working.markSittingResolution(match, resolution)
  }

  async reset (): Promise<void> {
    this.working.reset()
  }
}
