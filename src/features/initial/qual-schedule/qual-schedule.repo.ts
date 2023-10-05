import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma/prisma.service'
import { AllianceUpload, QualScheduleBlockUpload, QualScheduleMatchUpload } from './qual-schedule.interface'

@Injectable()
export class QualScheduleRepo {
  constructor (private readonly repo: PrismaService) { }

  async createBlock (block: QualScheduleBlockUpload): Promise<number> {
    const data = {
      start: block.start
    }
    const { id } = await this.repo.matchBlock.create({ data })
    return id
  }

  async createAlliance (alliance: AllianceUpload): Promise<number> {
    const data = {
      team1Number: alliance.team1,
      team2Number: alliance.team2
    }

    const { id } = await this.repo.alliance.create({ data })
    return id
  }

  async createMatch (red: number, blue: number, match: QualScheduleMatchUpload): Promise<number> {
    const data = {
      redId: red,
      blueId: blue,
      number: match.number,
      round: 'QUAL'
    }

    const { id } = await this.repo.match.create({ data })
    return id
  }

  async appendMatchToBlock (blockId: number, matchId: number): Promise<void> {
    const data = { matchId, resolution: 0 }
    const { id: scheduledMatchId } = await this.repo.scheduledMatch.create({ data })

    const block = await this.repo.matchBlock.findUnique({ where: { id: blockId } })

    if (block === null) {
      throw new BadRequestException('Block does not exist')
    }

    let nextMatchId = block.firstMatchId

    if (nextMatchId === null) {
      await this.repo.matchBlock.update({ where: { id: blockId }, data: { firstMatchId: matchId } })
    }

    while (nextMatchId !== null) {
      const nextMatch = await this.repo.scheduledMatch.findUnique({ where: { id: nextMatchId } })

      if (nextMatch === null) {
        throw new Error('Nonexistent match referenced')
      }

      if (nextMatch.nextMatchId === null) {
        await this.repo.scheduledMatch.update({ where: { id: nextMatchId }, data: { nextMatchId: scheduledMatchId } })
        break
      }

      nextMatchId = nextMatch.nextMatchId
    }
  }
}
