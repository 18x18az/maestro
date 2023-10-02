import { BadRequestException, Injectable, Logger, InternalServerErrorException } from '@nestjs/common'
import { DisplaysPublisher } from './displays.publisher'
import { DisplaysDatabase } from './displays.repo'

@Injectable()
export class DisplaysService {
  private readonly logger = new Logger(DisplaysService.name)

  constructor (
    private readonly publisher: DisplaysPublisher,
    private readonly database: DisplaysDatabase
  ) {}

  async onApplicationBootstrap (): Promise<void> {
    const displays = await this.database.getAllDisplays()
    await Promise.all(displays.map(async (display) => await this.broadcastConfig(display.uuid)))
  }

  private async broadcastConfig (uuid: string): Promise<void> {
    const display = await this.database.getDisplay(uuid)
    if (display === null) {
      this.logger.error(
        `Cannot broadcast DisplayConfig with UUID "${uuid}" because DisplayConfig could not be found`
      )
      throw new InternalServerErrorException()
    }
    await this.publisher.publishDisplay(uuid, display)
  }

  async registerDisplay (uuid: string): Promise<void> {
    this.logger.log(
      `Received registration request from display with UUID "${uuid}"`
    )
    if (await this.database.getDisplay(uuid) === null) { await this.database.createDisplay(uuid) }
    await this.broadcastConfig(uuid)
  }

  async adviseHasFieldControl (
    uuid: string,
    hasFieldControl: boolean
  ): Promise<void> {
    this.logger.log(
      `Display with UUID "${uuid}" has field control: ${String(hasFieldControl)}`
    )
  }

  async setDisplayName (uuid: string, displayName: string): Promise<void> {
    this.logger.log(
      `Display with UUID "${uuid}" 's name has been set to: "${displayName}"`
    )
    try {
      await this.database.setDisplayName(uuid, displayName)
    } catch {
      this.logger.warn(
      `Display with UUID "${uuid}" 's name failed to be set to: "${displayName}"\n\tIs there a display with UUID "${uuid}"?`
      )
      throw new BadRequestException()
    }
    await this.broadcastConfig(uuid)
  }

  async assignFieldId (uuid: string, fieldId: string): Promise<void> {
    this.logger.log(
      `Display with UUID "${uuid}" has been assigned to fieldId: "${fieldId}"`
    )
    try {
      await this.database.setFieldId(uuid, fieldId)
    } catch {
      this.logger.warn(
        `Display with UUID "${uuid}" failed to be assigned to fieldId: "${fieldId}"\n\tIs there a display with UUID "${uuid}"?`
      )
      throw new BadRequestException()
    }
    await this.broadcastConfig(uuid)
  }
}
