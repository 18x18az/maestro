import { PrismaService } from '@/utils'
import { Injectable } from '@nestjs/common'
import { Round, Alliance, Match, MatchBlock, ReplayStatus, BlockStatus } from './match.interface'
import { Match as PrismaMatch } from '@prisma/client'

export interface CreateMatchDto {
  round: Round
  matchNum: number
  sitting: number
  red: Alliance
  blue: Alliance
}

export interface CreateScheduledMatchDto {
  blockId: number
  matchId: number
  fieldId: number
  time?: string
  replay?: number
}

function parseMatch (match: PrismaMatch): Match {
  return {
    id: match.id,
    round: match.round as Round,
    matchNum: match.number,
    sitting: match.sitting,
    red: {
      team1: match.red1,
      team2: match.red2
    },
    blue: {
      team1: match.blue1,
      team2: match.blue2
    }
  }
}

@Injectable()
export class MatchRepo {
  constructor (private readonly prisma: PrismaService) {}

  async reset (): Promise<void> {
    await this.prisma.scheduledMatch.deleteMany({})
    await this.prisma.match.deleteMany({})
    await this.prisma.block.deleteMany({})
  }

  async createBlock (): Promise<number> {
    const { id } = await this.prisma.block.create({})
    return id
  }

  async createScheduledMatch (match: CreateScheduledMatchDto): Promise<number> {
    const { id } = await this.prisma.scheduledMatch.create({
      data: {
        blockId: match.blockId,
        matchId: match.matchId,
        fieldId: match.fieldId,
        time: match.time,
        replay: match.replay ?? 0,
        status: ReplayStatus.NOT_STARTED
      }
    })

    return id
  }

  async createMatch (match: CreateMatchDto): Promise<number> {
    const { id } = await this.prisma.match.create({
      data: {
        round: match.round,
        number: match.matchNum,
        sitting: match.sitting,
        red1: match.red.team1,
        red2: match.red.team2,
        blue1: match.blue.team1,
        blue2: match.blue.team2
      }
    })

    return id
  }

  async getQuals (): Promise<Match[]> {
    const matches = await this.prisma.match.findMany({
      where: {
        round: Round.QUAL
      }
    })

    return matches.map(parseMatch)
  }

  async getElims (): Promise<Match[]> {
    const matches = await this.prisma.match.findMany({
      where: {
        NOT: {
          round: Round.QUAL
        }
      }
    })

    return matches.map(parseMatch)
  }

  async getQualBlocks (): Promise<MatchBlock[]> {
    const blocks = await this.prisma.block.findMany({
      where: {
        scheduledMatches: {
          some: {
            match: {
              round: Round.QUAL
            }
          }
        }
      },
      include: {
        scheduledMatches: {
          include: {
            match: true,
            field: true
          }
        }
      }
    })

    return blocks.map(block => ({
      id: block.id,
      status: block.status as BlockStatus,
      matches: block.scheduledMatches.map(scheduledMatch => ({
        ...parseMatch(scheduledMatch.match),
        matchId: scheduledMatch.matchId,
        fieldName: scheduledMatch.field.name,
        fieldId: scheduledMatch.fieldId,
        time: scheduledMatch.time ?? undefined,
        replay: scheduledMatch.replay,
        status: scheduledMatch.status as ReplayStatus
      }))
    }))
  }
}
