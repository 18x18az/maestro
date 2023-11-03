import { PrismaService } from '@/utils'
import { Injectable } from '@nestjs/common'
import { Round, Alliance, Match, MatchBlock, ReplayStatus, BlockStatus, MatchIdentifier } from './match.interface'
import { Match as PrismaMatch, ScheduledMatch } from '@prisma/client'

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

  async setStatus (replayId: number, status: ReplayStatus): Promise<void> {
    await this.prisma.scheduledMatch.update({
      where: {
        id: replayId
      },
      data: {
        status
      }
    })
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

  async getCurrentBlock (): Promise<MatchBlock | null> {
    const blockId = await this.prisma.block.findFirst({
      where: {
        status: BlockStatus.IN_PROGRESS
      },
      select: {
        id: true
      }
    })

    if (blockId === null) {
      return null
    }

    return await this.getBlock(blockId.id)
  }

  async endCurrentBlock (): Promise<void> {
    const blockId = await this.prisma.block.findFirst({
      where: {
        status: BlockStatus.IN_PROGRESS
      },
      select: {
        id: true
      }
    })

    if (blockId === null) {
      return
    }

    await this.prisma.block.update({
      where: {
        id: blockId.id
      },
      data: {
        status: BlockStatus.FINISHED
      }
    })
  }

  async cueNextBlock (): Promise<MatchBlock | null> {
    const blockId = await this.prisma.block.findFirst({
      where: {
        status: BlockStatus.NOT_STARTED
      },
      orderBy: {
        id: 'asc'
      },
      select: {
        id: true
      }
    })

    if (blockId === null) {
      return null
    }

    await this.prisma.block.update({
      where: {
        id: blockId.id
      },
      data: {
        status: BlockStatus.IN_PROGRESS
      }
    })

    return await this.getBlock(blockId.id)
  }

  async getBlock (blockId: number): Promise<MatchBlock | null> {
    const block = await this.prisma.block.findUnique({
      where: {
        id: blockId
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

    if (block === null) {
      return null
    }

    return {
      id: block.id,
      status: block.status as BlockStatus,
      matches: block.scheduledMatches.map(scheduledMatch => ({
        ...parseMatch(scheduledMatch.match),
        matchId: scheduledMatch.matchId,
        replayId: scheduledMatch.id,
        fieldName: scheduledMatch.field.name,
        fieldId: scheduledMatch.fieldId,
        time: scheduledMatch.time ?? undefined,
        replay: scheduledMatch.replay,
        status: scheduledMatch.status as ReplayStatus
      }))
    }
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
    const blockIds = await this.prisma.block.findMany({
      where: {
        status: BlockStatus.IN_PROGRESS
      },
      select: {
        id: true
      }
    })

    const blocks: MatchBlock[] = []
    for (const blockId of blockIds) {
      const block = await this.getBlock(blockId.id)
      if (block !== null) {
        blocks.push(block)
      }
    }

    return blocks
  }

  async getFieldOfLastMatchOfBlock (blockId: number): Promise<Number | null> {
    const match = await this.prisma.scheduledMatch.findFirst({
      where: {
        blockId
      },
      orderBy: {
        matchId: 'desc'
      },
      select: {
        fieldId: true
      }
    })

    if (match === null) {
      return null
    }

    return match.fieldId
  }

  async getMatchByIdentifier (ident: MatchIdentifier): Promise<Match | null> {
    const match = await this.prisma.match.findUnique({
      where: {
        round_number_sitting: {
          round: ident.round,
          number: ident.matchNum,
          sitting: ident.sitting
        }
      }
    })

    if (match === null) {
      return null
    }

    return parseMatch(match)
  }

  async getLastReplay (matchId: number): Promise<ScheduledMatch | null> {
    const match = await this.prisma.scheduledMatch.findFirst({
      where: {
        matchId
      },
      orderBy: {
        replay: 'desc'
      }
    })

    if (match === null) {
      return null
    }

    return match
  }

  async checkExists (ident: MatchIdentifier): Promise<boolean> {
    const match = await this.prisma.match.findUnique({
      where: {
        round_number_sitting: {
          round: ident.round,
          number: ident.matchNum,
          sitting: ident.sitting
        }
      }
    })

    return match !== null
  }
}
