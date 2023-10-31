import { PrismaService } from '@/utils'
import { Injectable } from '@nestjs/common'
import { Field } from './field.interface'

@Injectable()
export class FieldRepo {
  constructor (private readonly repo: PrismaService) {}

  async getCompetitionFields (): Promise<Field[]> {
    const fields = await this.repo.field.findMany({
      where: {
        isCompetition: 1,
        isEnabled: 1
      },
      orderBy: {
        id: 'asc'
      }
    })

    return fields.map(field => ({
      id: field.id,
      name: field.name,
      isCompetition: field.isCompetition === 1,
      isEnabled: field.isEnabled === 1
    }))
  }

  async getCompetitionFieldName (fieldId: number): Promise<string> {
    const field = await this.repo.field.findUnique({
      where: {
        id: fieldId
      }
    })

    if (field === null) {
      throw new Error(`Field ${fieldId} not found`)
    }

    return field.name
  }

  async initializeCompetitionFields (fields: string[]): Promise<void> {
    const existingFields = await this.repo.field.count({
      where: {
        isCompetition: 1
      }
    })

    if (existingFields < fields.length) {
      for (let i = existingFields; i < fields.length; i++) {
        await this.repo.field.create({
          data: {
            name: fields[i],
            isCompetition: 1,
            isEnabled: 1
          }
        })
      }
    }

    const sortedFields = await this.repo.field.findMany({
      where: {
        isCompetition: 1
      },
      orderBy: {
        id: 'asc'
      }
    })

    for (let i = 0; i < sortedFields.length; i++) {
      await this.repo.field.update({
        where: {
          id: sortedFields[i].id
        },
        data: {
          isEnabled: 1,
          name: fields[i]
        }
      })
    }
  }
}
