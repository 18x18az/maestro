import { Injectable } from '@nestjs/common'
import { PrismaService } from 'utils/prisma/prisma.service'
import { Alliance, MatchResolution, QualMatch, QualScheduleBlockUpload, QualScheduleMatchUpload } from './qual-list.interface'

@Injectable()
export class PersistentRepo {
  constructor (private readonly repo: PrismaService) { }

  async createBlock (block: QualScheduleBlockUpload): Promise<number> {
    const data = {
      start: block.start
    }
    const { id } = await this.repo.matchBlock.create({ data })
    return id
  }

  async createAlliance (alliance: Alliance): Promise<number> {
    const data = {
      team1Number: alliance.team1,
      team2Number: alliance.team2
    }

    const { id } = await this.repo.alliance.create({ data })
    return id
  }

  async createMatch (match: QualScheduleMatchUpload): Promise<number> {
    const red = this.createAlliance(match.redAlliance)
    const blue = this.createAlliance(match.blueAlliance)

    const data = {
      redId: await red,
      blueId: await blue,
      number: match.number,
      round: 'QUAL'
    }

    const { id } = await this.repo.match.create({ data })
    return id
  }

  async getMatchBlockIds (): Promise<number[]> {
    const blockIds = (await this.repo.matchBlock.findMany({ select: { id: true } })).map(block => block.id)
    return blockIds
  }

  async createScheduledMatch (match: QualMatch): Promise<number> {
    const scheduledMatch = await this.repo.scheduledMatch.create({
      data: {
        matchId: match.id,
        resolution: MatchResolution.NOT_STARTED,
        nextMatchId: null
      }
    })
    return scheduledMatch.id
  }

  async addMatchAfter (previousId: number, nextSittingId: number): Promise<void> {
    await this.repo.scheduledMatch.update({ where: { id: previousId }, data: { nextMatchId: nextSittingId } })
  }

  async addFirstMatch (blockId: number, sittingId: number): Promise<void> {
    await this.repo.matchBlock.update({ where: { id: blockId }, data: { firstMatchId: sittingId } })
  }
}
