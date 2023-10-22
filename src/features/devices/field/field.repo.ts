import { PrismaService } from '@/utils/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { FieldInfo, FieldInfoBroadcast, FieldState } from './fields.interface'

@Injectable()
export class FieldRepo {
  private readonly working: Map<string, FieldInfoBroadcast> = new Map()
  constructor (private readonly db: PrismaService) {}

  clearFields (): void {
    this.working.clear()
  }

  async createField (field: FieldInfo): Promise<void> {
    const created = await this.db.field.create({
      data: {
        name: field.name,
        isCompetition: Number(field.isCompetition)
      }
    })
    this.working.set(created.id.toString(), {
      name: created.name,
      isCompetition: Boolean(created.isCompetition),
      fieldId: created.id,
      state: FieldState.IDLE
    })
  }

  async getFields (): Promise<FieldInfoBroadcast[]> {
    if (this.working.size === 0) {
      const fields = await this.db.field.findMany()
      fields.forEach(field => {
        this.working.set(field.id.toString(), {
          name: field.name,
          isCompetition: Boolean(field.isCompetition),
          fieldId: field.id,
          state: FieldState.IDLE
        })
      })
    }

    return Array.from(this.working.values())
  }
}
