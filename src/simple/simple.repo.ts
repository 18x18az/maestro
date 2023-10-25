import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '@/utils/prisma/prisma.service'
import { Field, MatchBlock, Match, BLOCK_STATE, MATCH_STATE, MatchIdentifier } from './simple.interface'

@Injectable()
export class SimpleRepo {
  constructor (private readonly repo: PrismaService) {}

  async getFieldIds (): Promise<number[]> {
    const fields = await this.repo.simpleField.findMany({
      select: {
        id: true
      }
    })

    return fields.map(field => field.id)
  }

  async getFields (): Promise<Field[]> {
    const fields = await this.repo.simpleField.findMany({
      select: {
        id: true,
        name: true
      },
      where: {
        name: {
          not: 'UNUSED'
        }
      }
    })

    return fields
  }

  async setFieldNames (fieldNames: string[]): Promise<void> {
    const fieldIds = await this.getFieldIds()
    const numFields = fieldNames.length

    for (let i = 0; i < numFields; i++) {
      const fieldId = fieldIds[i]
      const fieldName = fieldNames[i]

      await this.repo.simpleField.update({
        where: {
          id: fieldId
        },
        data: {
          name: fieldName
        }
      })
    }

    const extra = fieldIds.slice(numFields)
    for (const fieldId of extra) {
      await this.repo.simpleField.update({
        where: {
          id: fieldId
        },
        data: {
          name: 'UNUSED'
        }
      })
    }
  }

  async ensureFieldsExists (): Promise<void> {
    const numFields = (await this.getFieldIds()).length
    const requiredFields = 3 - numFields

    if (requiredFields <= 0) return

    for (let i = 0; i < requiredFields; i++) {
      await this.repo.simpleField.create({
        data: {
          name: `Field ${numFields + i + 1}`
        }
      })
    }
  }

  async updateMatchStatus (match: MatchIdentifier | undefined, status: MATCH_STATE): Promise<void> {
    if (match === undefined) throw new BadRequestException('No match')

    await this.repo.simpleMatch.update({
      where: {
        round_number_sitting: {
          round: match.round,
          number: match.match,
          sitting: match.sitting
        }
      },
      data: {
        status
      }
    })
  }

  async reset (): Promise<void> {
    await this.repo.simpleMatch.deleteMany({})
    await this.repo.simpleBlock.deleteMany({})
  }

  async getInProgressBlock (): Promise<number | null> {
    const block = await this.repo.simpleBlock.findFirst({
      where: {
        status: BLOCK_STATE.IN_PROGRESS
      }
    })

    if (block === null) {
      return null
    }

    return block.id
  }

  async getNextBlockId (): Promise<number | null> {
    const inProgress = await this.repo.simpleBlock.findMany({
      where: {
        status: BLOCK_STATE.IN_PROGRESS
      }
    })
    if (inProgress.length > 0) {
      throw new BadRequestException('A qual block is already in progress')
    }

    const block = await this.repo.simpleBlock.findFirst({
      where: {
        status: BLOCK_STATE.NOT_STARTED
      }
    })

    if (block === null) {
      return null
    }

    await this.repo.simpleBlock.update({
      where: {
        id: block.id
      },
      data: {
        status: BLOCK_STATE.IN_PROGRESS
      }
    })

    return block.id
  }

  async getCurrentMatch (fieldId: number, blockId: number): Promise<Match | null> {
    const match = await this.repo.simpleMatch.findFirst({
      where: {
        fieldId,
        blockId,
        status: {
          notIn: [MATCH_STATE.NOT_STARTED, MATCH_STATE.RESOLVED]
        }
      },
      orderBy: {
        number: 'asc'
      }
    })

    if (match === null) {
      return null
    }

    const time = match.scheduled === null ? undefined : new Date(match.scheduled)

    return {
      round: match.round,
      matchNum: match.number,
      sitting: match.sitting,
      fieldId: match.fieldId,
      red1: match.red1,
      red2: match.red2,
      blue1: match.blue1,
      blue2: match.blue2,
      time,
      status: match.status as MATCH_STATE
    }
  }

  async getNextMatch (fieldId: number, blockId: number): Promise<Match | null> {
    // get the match with the lowest number and status BLOCK_STATE.NOT_STARTED for this block and field
    const match = await this.repo.simpleMatch.findFirst({
      where: {
        fieldId,
        blockId,
        status: BLOCK_STATE.NOT_STARTED
      },
      orderBy: {
        number: 'asc'
      }
    })

    if (match === null) {
      return null
    }

    const time = match.scheduled === null ? undefined : new Date(match.scheduled)

    return {
      round: match.round,
      matchNum: match.number,
      sitting: match.sitting,
      fieldId: match.fieldId,
      red1: match.red1,
      red2: match.red2,
      blue1: match.blue1,
      blue2: match.blue2,
      time,
      status: match.status as MATCH_STATE
    }
  }

  async storeBlocks (blocks: MatchBlock[]): Promise<void> {
    for (const block of blocks) {
      const { id: blockId } = await this.repo.simpleBlock.create({
        data: {}
      })

      for (const match of block.matches) {
        const scheduled = match.time === undefined ? null : match.time.toISOString()
        await this.repo.simpleMatch.create({
          data: {
            blockId,
            round: match.round,
            number: match.matchNum,
            sitting: match.sitting,
            fieldId: match.fieldId,
            red1: match.red1,
            red2: match.red2,
            blue1: match.blue1,
            blue2: match.blue2,
            scheduled
          }
        })
      }
    }
  }
}
