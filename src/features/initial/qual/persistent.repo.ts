import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from 'utils/prisma/prisma.service'
import { Alliance, QualMatch, QualScheduleBlockUpload, QualScheduleMatchUpload } from './qual-list.interface'

const infoSelect = {
  id: true,
  number: true,
  red: {
    select: { team1Number: true, team2Number: true }
  },
  blue: {
    select: { team1Number: true, team2Number: true }
  }
}

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

  async clearSchedule (): Promise<void> {
    await this.repo.scheduledMatch.deleteMany({})
    await this.repo.match.deleteMany({})
    await this.repo.matchBlock.deleteMany({})
    await this.repo.alliance.deleteMany({})
  }

  async getMatches (): Promise<QualMatch[]> {
    const matches = await this.repo.match.findMany({
      select: infoSelect,
      where: { round: 'QUAL' },
      orderBy: { number: 'asc' }
    })

    const formattedMatches = matches.map(match => {
      return {
        id: match.id,
        number: match.number,
        red: {
          team1: match.red.team1Number,
          team2: match.red.team2Number ?? undefined
        },
        blue: {
          team1: match.blue.team1Number,
          team2: match.blue.team2Number ?? undefined
        }
      }
    })

    return formattedMatches
  }

  async getBlock (blockId: number): Promise<void> {
    const block = await this.repo.matchBlock.findUnique({ where: { id: blockId } })

    if (block === null) {
      throw new BadRequestException('Block does not exist')
    }

    // build match list by traversing linked list
    const matches: QualScheduleMatchUpload[] = []
    const firstMatchId = block.firstMatchId

    if (firstMatchId === null) {
      return
    }

    let nextMatchId: number | null = firstMatchId
    while (nextMatchId !== null) {
      const nextMatch = await this.repo.scheduledMatch.findUnique({
        where: { id: nextMatchId },
        include: {
          match: {
            select: {
              id: true,
              number: true,
              red: {
                select: { team1Number: true, team2Number: true }
              },
              blue: {
                select: { team1Number: true, team2Number: true }
              }
            }
          }
        }
      })

      if (nextMatch === null) {
        throw new Error('Nonexistent match referenced')
      }

      matches.push(nextMatch.match)

      nextMatchId = nextMatch.nextMatchId
    }

    console.log(matches)
  }

  async getMatchBlockIds (): Promise<number[]> {
    const blockIds = (await this.repo.matchBlock.findMany({ select: { id: true } })).map(block => block.id)
    return blockIds
  }
}
