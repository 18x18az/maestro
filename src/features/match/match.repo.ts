import { ElimsMatch, PrismaService } from '@/utils'
import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { BlockStatus, Match, MatchIdentifier, MatchStatus, Round } from './match.interface'
import { Block } from '@prisma/client'
import { parseMatch } from '@/utils/conversion/match'

export interface CreateQualDto {
  matchNumber: number
  red1: string
  red2: string
  blue1: string
  blue2: string
  field: number
  time: string
}

export interface CreateQualBlockDto {
  name: string
  quals: CreateQualDto[]
}

@Injectable()
export class MatchRepo {
  private readonly logger = new Logger(MatchRepo.name)

  constructor (private readonly prisma: PrismaService) {}

  async reset (): Promise<void> {
    await this.prisma.match.deleteMany({})
    await this.prisma.block.deleteMany({})
  }

  async getQuals (): Promise<Match[]> {
    // get all matches that are round qual
    const matches = await this.prisma.match.findMany({
      where: {
        round: Round.QUAL
      },
      include: {
        block: true,
        field: true
      }
    })

    return matches.map((match) => { return parseMatch(match) })
  }

  async getElims (): Promise<Match[]> {
    // get all matches that are not round qual
    const matches = await this.prisma.match.findMany({
      where: {
        round: {
          not: Round.QUAL
        }
      },
      include: {
        block: true,
        field: true
      }
    })

    return matches.map((match) => { return parseMatch(match) })
  }

  private async createQual (blockId: number, qual: CreateQualDto): Promise<void> {
    await this.prisma.match.create({
      data: {
        number: qual.matchNumber,
        red1: qual.red1,
        red2: qual.red2,
        blue1: qual.blue1,
        blue2: qual.blue2,
        fieldId: qual.field,
        round: Round.QUAL,
        sitting: 0,
        blockId,
        time: qual.time
      }
    })
  }

  private async createQualBlock (block: CreateQualBlockDto): Promise<void> {
    this.logger.log(`Creating block ${block.name}`)
    const { id: blockId } = await this.prisma.block.create({
      data: {
        name: block.name
      }
    })
    for (const qual of block.quals) {
      await this.createQual(blockId, qual)
    }
  }

  async createQuals (blocks: CreateQualBlockDto[]): Promise<void> {
    for (const block of blocks) {
      await this.createQualBlock(block)
    }
  }

  async getCurrentBlock (): Promise<Block | null> {
    const block = await this.prisma.block.findFirst({
      where: {
        status: BlockStatus.IN_PROGRESS
      }
    })
    if (block === null) {
      return null
    }
    return block
  }

  async getUnqueuedQuals (includeReplays: boolean, cutoffMatch?: number): Promise<Match[]> {
    const currentBlock = await this.getCurrentBlock()

    if (currentBlock === null) {
      return []
    }

    const matches: Match[] = []

    // First get matches from the previous blocks
    const earlierMatches = (await this.prisma.match.findMany({
      where: {
        block: {
          id: {
            lt: currentBlock.id
          }
        },
        status: MatchStatus.NOT_STARTED
      },
      include: {
        block: true,
        field: true
      }
    })).map((match) => { return parseMatch(match) })
    matches.push(...earlierMatches)

    // Next get matches from the current block ordered by match number
    const currentMatches = (await this.prisma.match.findMany({
      where: {
        block: {
          id: currentBlock.id
        },
        status: MatchStatus.NOT_STARTED
      },
      orderBy: {
        number: 'asc'
      },
      include: {
        block: true,
        field: true
      }
    })).map((match) => { return parseMatch(match) })
    matches.push(...currentMatches)

    if (cutoffMatch !== undefined) {
      const cutoffIndex = matches.findIndex((match) => match.number === cutoffMatch)
      if (cutoffIndex !== -1) {
        return matches.splice(cutoffIndex)
      }
    }

    if (!includeReplays) {
      return matches
    }

    // Finally get matches from the current or previous blocks that need to be replayed
    const replayMatches = (await this.prisma.match.findMany({
      where: {
        OR: [
          {
            block: {
              id: {
                lt: currentBlock.id
              }
            },
            status: MatchStatus.NEEDS_REPLAY
          },
          {
            block: {
              id: currentBlock.id
            },
            status: MatchStatus.NEEDS_REPLAY
          }
        ]
      },
      include: {
        block: true,
        field: true
      }
    })).map((match) => { return parseMatch(match) })

    matches.push(...replayMatches)

    return matches
  }

  async updateMatchStatus (matchId: number, status: MatchStatus): Promise<void> {
    await this.prisma.match.update({
      where: {
        id: matchId
      },
      data: {
        status
      }
    })
  }

  async startNextBlock (): Promise<boolean> {
    const block = await this.prisma.block.findFirst({
      where: {
        status: BlockStatus.NOT_STARTED
      }
    })
    if (block === null) {
      return false
    }
    await this.prisma.block.update({
      where: {
        id: block.id
      },
      data: {
        status: 'IN_PROGRESS'
      }
    })

    return true
  }

  async getQueuedMatches (): Promise<Match[]> {
    const matches = await this.prisma.match.findMany({
      where: {
        status: MatchStatus.QUEUED
      },
      include: {
        block: true,
        field: true
      }
    })
    return matches.map((match) => { return parseMatch(match) })
  }

  async getScoringMatches (): Promise<Match[]> {
    const matches = await this.prisma.match.findMany({
      where: {
        status: MatchStatus.SCORING
      },
      include: {
        block: true,
        field: true
      }
    })
    return matches.map((match) => { return parseMatch(match) })
  }

  async removeFieldAssignment (matchId: number): Promise<void> {
    await this.prisma.match.update({
      where: {
        id: matchId
      },
      data: {
        fieldId: null
      }
    })
  }

  async endCurrentBlock (): Promise<void> {
    const block = await this.getCurrentBlock()
    if (block === null) {
      throw new BadRequestException('No block in progress')
    }
    await this.prisma.block.update({
      where: {
        id: block.id
      },
      data: {
        status: BlockStatus.FINISHED
      }
    })
  }

  async createElimsBlock (): Promise<number> {
    const block = await this.prisma.block.create({
      data: {
        name: 'Elims',
        status: BlockStatus.IN_PROGRESS
      }
    })

    return block.id
  }

  async getMatch (match: MatchIdentifier): Promise<Match | null> {
    const matchRecord = await this.prisma.match.findUnique({
      where: {
        round_number_sitting: {
          round: match.round,
          number: match.matchNumber,
          sitting: match.sitting
        }
      },
      include: {
        block: true,
        field: true
      }
    })

    if (matchRecord === null) {
      return null
    }

    return parseMatch(matchRecord)
  }

  async createElimsMatch (match: ElimsMatch): Promise<void> {
    const elimsBlockId = await this.prisma.block.findFirst({
      where: {
        name: 'Elims'
      }
    })

    if (elimsBlockId === null) {
      throw new BadRequestException('No elims block')
    }

    await this.prisma.match.create({
      data: {
        number: match.identifier.matchNumber,
        red1: match.red.team1,
        red2: match.red.team2 ?? '',
        blue1: match.blue.team1,
        blue2: match.blue.team2 ?? '',
        round: match.identifier.round,
        sitting: match.identifier.sitting,
        blockId: elimsBlockId.id
      }
    })
  }
}
