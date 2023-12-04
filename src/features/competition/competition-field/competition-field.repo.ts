import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/utils'

@Injectable()
export class CompetitionFieldRepo {
  private readonly logger: Logger = new Logger(CompetitionFieldRepo.name)

  constructor (private readonly repo: PrismaService) {}

  async getMatchOnField (fieldId: number): Promise<number | null> {
    const field = await this.repo.field.findUnique({
      where: {
        id: fieldId
      },
      select: {
        onField: {
          select: {
            matchId: true
          }
        }
      }
    })

    if (field === null) {
      this.logger.warn(`Field ${fieldId} not found`)
      throw new NotFoundException(`Field ${fieldId} not found`)
    }

    if (field.onField === null) {
      return null
    }

    return field.onField.matchId
  }

  async getMatchOnDeck (fieldId: number): Promise<number | null> {
    const field = await this.repo.field.findUnique({
      where: {
        id: fieldId
      },
      select: {
        onDeck: {
          select: {
            matchId: true
          }
        }
      }
    })

    if (field === null) {
      this.logger.warn(`Field ${fieldId} not found`)
      throw new NotFoundException(`Field ${fieldId} not found`)
    }

    if (field.onDeck === null) {
      return null
    }

    return field.onDeck.matchId
  }

  async removeOnField (fieldId: number): Promise<void> {
    await this.repo.field.update({
      where: {
        id: fieldId
      },
      data: {
        onField: {
          delete: true
        }
      }
    })
  }

  async removeOnDeck (fieldId: number): Promise<void> {
    await this.repo.field.update({
      where: {
        id: fieldId
      },
      data: {
        onDeck: {
          delete: true
        }
      }
    })
  }

  async moveOnDeckToOnField (fieldId: number): Promise<void> {
    const matchId = await this.getMatchOnDeck(fieldId)

    if (matchId === null) {
      throw new Error(`Field ${fieldId} has no match on deck`)
    }

    await this.repo.onDeckMatch.delete({
      where: {
        matchId
      }
    })

    await this.repo.onFieldMatch.create({
      data: {
        fieldId,
        matchId
      }
    })
  }

  async putOnField (fieldId: number, matchId: number): Promise<void> {
    await this.repo.onFieldMatch.create({
      data: {
        fieldId,
        matchId
      }
    })
  }

  async putOnDeck (fieldId: number, matchId: number): Promise<void> {
    await this.repo.onDeckMatch.create({
      data: {
        fieldId,
        matchId
      }
    })
  }

  async getMatchLocation (matchId: number): Promise<{ fieldId: number, location: 'ON_DECK' | 'ON_FIELD' }> {
    const field = await this.repo.field.findFirst({
      where: {
        onDeck: {
          matchId
        }
      },
      select: {
        id: true
      }
    })

    if (field !== null) {
      return {
        fieldId: field.id,
        location: 'ON_DECK'
      }
    }

    const field2 = await this.repo.field.findFirst({
      where: {
        onField: {
          matchId
        }
      },
      select: {
        id: true
      }
    })

    if (field2 !== null) {
      return {
        fieldId: field2.id,
        location: 'ON_FIELD'
      }
    }

    this.logger.warn(`Match ${matchId} is not on field or on deck`)
    throw new BadRequestException(`Match ${matchId} is not on field or on deck`)
  }
}
