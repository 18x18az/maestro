import { Injectable } from '@nestjs/common'
import { PersistentRepo } from './persistent.repo'
import { WorkingRepo } from './working.repo'
import { MatchResolution, QualMatch, QualMatchBlockBroadcast, QualMatchSitting, QualScheduleBlockUpload, QualScheduleMatchUpload } from './qual-list.interface'

@Injectable()
export class QualListRepo {
  constructor (private readonly persistent: PersistentRepo, private readonly working: WorkingRepo) {}

  // async hydrateQuals (): Promise<boolean> {
  //   const quals = await this.persistent.getMatches()
  //   if (quals.length === 0) {
  //     return false
  //   }
  //   this.working.hydrateQuals(quals)

  //   const existingBlockIds = await this.persistent.getMatchBlockIds()
  //   const existingBlocks = existingBlockIds.map(async id => await this.persistent.getBlock(id))

  //   return true
  // }

  async createBlock (block: QualScheduleBlockUpload): Promise<number> {
    const blockId = this.persistent.createBlock(block)
    this.working.addBlock({ ...block, id: await blockId })
    return await blockId
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

  async appendMatchToBlock (blockId: number, matchId: number): Promise<void> {
    const block = this.getBlock(blockId)
    const match = this.getMatch(matchId)

    const previousNumber = this.working.getPreviousNumber(matchId)
    const previousId = this.working.getFinalMatchId(blockId)

    const sittingId = await this.persistent.createScheduledMatch(match)

    const sitting: QualMatchSitting = {
      ...match, sittingId, sitting: previousNumber + 1, resolution: MatchResolution.NOT_STARTED, field: 'TODO'
    }

    block.matches.push(sitting)
    if (previousId === null) {
      await this.persistent.addFirstMatch(blockId, sittingId)
    } else {
      await this.persistent.addMatchAfter(previousId, sittingId)
    }
  }
}
