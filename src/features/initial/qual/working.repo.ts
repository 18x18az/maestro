import { Injectable } from '@nestjs/common'
import { QualMatch, QualMatchBlockBroadcast, QualScheduleBlockMetadata } from './qual-list.interface'

@Injectable()
export class WorkingRepo {
  private readonly qualMatches: QualMatch[] = []
  private readonly qualBlocks: Map<string, QualMatchBlockBroadcast> = new Map()

  hydrateQuals (quals: QualMatch[]): void {
    if (this.qualMatches.length !== 0) {
      throw new Error('Quals already hydrated')
    }
    this.qualMatches.push(...quals)
  }

  addQual (qual: QualMatch): void {
    this.qualMatches.push(qual)
  }

  addBlock (block: QualScheduleBlockMetadata): void {
    const fullBlock: QualMatchBlockBroadcast = {
      ...block, matches: []
    }
    this.qualBlocks.set(block.id.toString(), fullBlock)
  }

  getBlock (blockId: number): QualMatchBlockBroadcast {
    const block = this.qualBlocks.get(blockId.toString())
    if (block === undefined) {
      throw new Error('Block not found')
    }
    return block
  }

  getMatch (matchId: number): QualMatch {
    const match = this.qualMatches.find(match => match.id === matchId)
    if (match === undefined) {
      throw new Error('Match not found')
    }
    return match
  }

  getPreviousNumber (matchId: number): number {
    // find the number of matches in all qual blocks with this match ID, return 0 if zero
    const allPrevious = Object.values(this.qualBlocks).flatMap(block => block.matches) as QualMatch[]
    const matches = allPrevious.filter(match => match.id === matchId).length
    return matches
  }

  getFinalMatchId (blockId: number): number | null {
    const block = this.getBlock(blockId)
    if (block.matches.length === 0) {
      return null
    }
    return block.matches[block.matches.length - 1].sittingId
  }
}
