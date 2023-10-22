import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../utils/prisma/prisma.service'

@Injectable()
export class ResetRepo {
  constructor (private readonly prisma: PrismaService) {}
  async reset (): Promise<void> {
    await this.prisma.matchScore.deleteMany({})
    await this.prisma.scheduledMatch.deleteMany({})
    await this.prisma.match.deleteMany({})
    await this.prisma.alliance.deleteMany({})
    await this.prisma.matchBlock.deleteMany({})
    await this.prisma.checkedInspection.deleteMany({})
    await this.prisma.checkIn.deleteMany({})
    await this.prisma.team.deleteMany({})
    await this.prisma.field.deleteMany({})
    await this.prisma.genericEphemeral.deleteMany({})
  }
}
