import { PrismaService } from '@/utils'
import { Injectable } from '@nestjs/common'
import { Match, MatchIdentifier } from '../match'
import { parseMatch } from '@/utils/conversion/match'

interface GetFieldStatusDto {
  onDeck: Match | null
  onField: Match | null
}

@Injectable()
export class FieldControlRepo {
  constructor (
    private readonly repo: PrismaService
  ) {}

  async getFieldStatus (fieldid: number): Promise<GetFieldStatusDto> {
    const field = await this.repo.field.findUnique({
      where: {
        id: fieldid
      },
      include: {
        onDeck: {
          include: {
            block: true,
            field: true
          }
        },
        onField: {
          include: {
            block: true,
            field: true
          }
        }
      }
    })

    if (field === null) {
      throw new Error(`Field ${fieldid} not found`)
    }

    const onDeck = field.onDeck === null ? null : parseMatch(field.onDeck)
    const onField = field.onField === null ? null : parseMatch(field.onField)
    return { onDeck, onField }
  }

  async findMatchField (matchId: number): Promise<number | null> {
    // find where the match is either on deck or on field
    const field = await this.repo.field.findFirst({
      where: {
        OR: [
          {
            onDeckId: matchId
          },
          {
            onFieldId: matchId
          }
        ]
      }
    })

    return field === null ? null : field.id
  }

  async getMatchOnField (fieldId: number): Promise<Match | null> {
    const field = await this.repo.field.findUnique({
      where: {
        id: fieldId
      },
      include: {
        onField: {
          include: {
            block: true,
            field: true
          }
        }
      }
    })

    if (field === null) {
      throw new Error(`Field ${fieldId} not found`)
    }

    return field.onField === null ? null : parseMatch(field.onField)
  }

  async findMatch (identifier: MatchIdentifier): Promise<Match | null> {
    const match = await this.repo.match.findUnique({
      where: {
        round_number_sitting: {
          round: identifier.round,
          number: identifier.matchNumber,
          sitting: identifier.sitting
        }
      },
      include: {
        block: true,
        field: true
      }
    })

    if (match === null) {
      return null
    }

    return parseMatch(match)
  }
}
