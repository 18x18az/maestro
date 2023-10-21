import { PrismaService } from '@/utils/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { FieldInfo } from './fields.interface'

@Injectable()
export class FieldRepo {
  constructor (private readonly db: PrismaService) {}

  async createField (field: FieldInfo): Promise<void> {
    await this.db.field.create({
      data: {
        name: field.name,
        isCompetition: Number(field.isCompetition)
      }
    })
  }
}
