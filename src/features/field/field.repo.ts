import { PrismaService } from '@/utils'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { Field } from './field.interface'

@Injectable()
export class FieldRepo {
  constructor (private readonly repo: PrismaService) {}

  private readonly logger: Logger = new Logger(FieldRepo.name)

  private async getField (id: number): Promise<Field> {
    const field = await this.repo.field.findUnique({
      where: {
        id
      }
    })

    if (field === null) {
      throw new NotFoundException(`Field ${id} not found`)
    }

    return {
      id: field.id,
      name: field.name,
      isCompetition: field.isCompetition === 1,
      isSkills: field.isSkills === 1
    }
  }

  async getCompetitionFields (): Promise<Field[]> {
    const fields = await this.repo.field.findMany({
      where: {
        isCompetition: 1
      },
      orderBy: {
        id: 'asc'
      }
    })

    return fields.map(field => ({
      id: field.id,
      name: field.name,
      isCompetition: field.isCompetition === 1,
      isSkills: field.isSkills === 1
    }))
  }

  async getAllFields (): Promise<Field[]> {
    const fields = await this.repo.field.findMany({
      orderBy: {
        id: 'asc'
      }
    })

    return fields.map(field => ({
      id: field.id,
      name: field.name,
      isCompetition: field.isCompetition === 1,
      isSkills: field.isSkills === 1
    }))
  }

  async getFieldName (fieldId: number): Promise<string> {
    const field = await this.getField(fieldId)
    return field.name
  }

  async initializeCompetitionFields (fields: string[]): Promise<void> {
    const existingFields = await this.repo.field.count({})

    if (existingFields < fields.length) {
      for (let i = existingFields; i < fields.length; i++) {
        this.logger.log(`Creating field ${fields[i]}`)
        await this.repo.field.create({
          data: {
            name: fields[i],
            isCompetition: 1,
            isSkills: 0
          }
        })
      }
    }

    const sortedFields = await this.repo.field.findMany({
      orderBy: {
        id: 'asc'
      }
    })

    for (let i = 0; i < fields.length; i++) {
      await this.repo.field.update({
        where: {
          id: sortedFields[i].id
        },
        data: {
          name: fields[i],
          isCompetition: 1,
          isSkills: 0
        }
      })
    }
  }

  async addField (): Promise<void> {
    await this.repo.field.create({
      data: {
        name: 'Unnamed Field'
      }
    })
  }

  async setName (id: number, name: string): Promise<void> {
    await this.repo.field.update({
      where: {
        id
      },
      data: {
        name
      }
    })
  }

  async deleteField (id: number): Promise<void> {
    await this.repo.field.delete({
      where: {
        id
      }
    })
  }

  async isEnabled (id: number): Promise<boolean> {
    const field = await this.getField(id)

    if (field.isCompetition || field.isSkills) {
      return true
    } else {
      return false
    }
  }

  async isExclusivelyCompetition (id: number): Promise<boolean> {
    const field = await this.getField(id)

    return (field.isCompetition && !field.isSkills)
  }

  async isCompetition (id: number): Promise<boolean> {
    const field = await this.getField(id)
    return field.isCompetition
  }

  async setCanBeUsedForSkills (id: number, canBeUsedForSkills: boolean): Promise<void> {
    await this.repo.field.update({
      where: {
        id
      },
      data: {
        isSkills: canBeUsedForSkills ? 1 : 0
      }
    })
  }

  async get (id: number): Promise<Field> {
    return await this.getField(id)
  }

  async getNextField (id: number): Promise<Field> {
    const fields = await this.repo.field.findMany({
      where: {
        isCompetition: 1
      }
    })

    if (fields === null) {
      throw new Error('No competition fields')
    }

    const currentIndex = fields.findIndex(function (item, i) {
      return item.id === id
    })

    const nextIndex = (currentIndex + 1) % fields.length
    const field = fields[nextIndex]

    return {
      id: field.id,
      isCompetition: field.isCompetition === 1,
      isSkills: field.isSkills === 1,
      name: field.name
    }
  }
}
