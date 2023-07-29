import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma/prisma.service'

@Injectable()
export class StorageService {
  constructor (private readonly prisma: PrismaService) { }

  async setEphemeral (ident: string, value: string): Promise<void> {
    await this.prisma.genericEphemeral.upsert({ where: { key: ident }, update: { value }, create: { key: ident, value } })
  }

  async getEphemeral (ident: string, fallback: string): Promise<string> {
    const existing = await this.prisma.genericEphemeral.findUnique({ where: { key: ident } })

    if (existing === null) {
      await this.setEphemeral(ident, fallback)
      return fallback
    }

    return existing.value
  }

  async setPersistent (ident: string, value: string): Promise<void> {
    await this.prisma.genericPersistent.upsert({ where: { key: ident }, update: { value }, create: { key: ident, value } })
  }

  async getPersistent (ident: string, fallback: string): Promise<string> {
    const existing = await this.prisma.genericPersistent.findUnique({ where: { key: ident } })

    if (existing === null) {
      await this.setPersistent(ident, fallback)
      return fallback
    }

    return existing.value
  }
}
