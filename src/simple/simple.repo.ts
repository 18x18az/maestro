import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/utils/prisma/prisma.service'
import { QualMatch } from './simple.interface'

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

  async getQuals (): Promise<QualMatch[]> {
    const matches = await this.repo.simpleMatch.findMany({
      select: {
        number: true,
        fieldId: true,
        red1: true,
        red2: true,
        blue1: true,
        blue2: true,
        scheduled: true
      },
      orderBy: {
        number: 'asc'
      },
      where: {
        round: 0
      }
    })

    return matches.map(match => {
      if (match.scheduled === null) {
        throw new Error('Match has no scheduled time')
      }
      return {
        matchNum: match.number,
        fieldId: match.fieldId,
        red1: match.red1,
        red2: match.red2,
        blue1: match.blue1,
        blue2: match.blue2,
        time: new Date(match.scheduled)
      }
    })
  }

  async storeQuals (quals: QualMatch[]): Promise<void> {
    for (const qual of quals) {
      await this.repo.simpleMatch.create({
        data: {
          round: 0,
          number: qual.matchNum,
          sitting: 0,
          fieldId: qual.fieldId,
          red1: qual.red1,
          red2: qual.red2,
          blue1: qual.blue1,
          blue2: qual.blue2,
          scheduled: qual.time.toISOString()
        }
      })
    }
  }
}
