import { PrismaService } from '@/utils'
import { Injectable } from '@nestjs/common'

@Injectable()
export class StageRepo {
  constructor (private readonly prisma: PrismaService) {}

  async reset (): Promise<void> {
    await this.prisma.field.updateMany({
      data: {
        onDeckId: null,
        onFieldId: null
      }
    })
    await this.prisma.match.deleteMany({})
    await this.prisma.block.deleteMany({})
    await this.prisma.field.updateMany({
      data: {
        isEnabled: 0
      }
    })
  }
}
