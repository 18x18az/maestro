import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../utils/prisma/prisma.service'
import { DisplayConfig } from './displays.interface'

@Injectable()
export class DisplaysDatabase {
  constructor (
    private readonly prisma: PrismaService
  ) {}

  async setDisplayName (uuid: string, name: string): Promise<void> {
    // @question I believe this should reject if it does not find a display with uuid, should the error be handled here or handled elsewhere?
    // should this potential to throw an error be stated in a comment of this function? (eg. /** @throws Will throw an error if display with uuid is not found */)
    await this.prisma.display.update({
      data: { name },
      where: { uuid }
    })
  }

  async setField (uuid: string, field: string): Promise<void> {
    // @question same here
    await this.prisma.display.update({
      data: { field },
      where: { uuid }
    })
  }

  async registerDisplay (uuid: string): Promise<void> {
    await this.prisma.display.create({
      data: { uuid, name: 'unnamed' }
    })
  }

  async getDisplay (uuid: string): Promise<DisplayConfig | null> {
    return await this.prisma.display.findUnique({ where: { uuid } })
  }

  async getField (uuid: string): Promise<string | undefined | null> {
    return (await this.getDisplay(uuid))?.field
  }

  async getName (uuid: string): Promise<string | undefined> {
    return (await this.getDisplay(uuid))?.name
  }
}
