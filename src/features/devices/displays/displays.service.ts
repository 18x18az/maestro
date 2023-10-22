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
    await this.broadcastAllDisplays()
  }

  private async broadcastAllDisplays (): Promise<void> {
    const displays = await this.database.getAllDisplays()
    await this.publisher.publishAllDisplays(displays)
  }

  private async onDisplayChange (uuid: string): Promise<void> {
    await this.broadcastConfig(uuid)
    await this.broadcastAllDisplays()
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
    await this.onDisplayChange(uuid)
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
      `Setting name of display ${uuid} to: "${displayName}"`
    )
    try {
      await this.database.setDisplayName(uuid, displayName)
    } catch {
      this.logger.warn(
        `Display with UUID "${uuid}" was not found`
      )
      throw new BadRequestException()
    }
    await this.onDisplayChange(uuid)
  }

  async assignFieldId (uuid: string, fieldId: number): Promise<void> {
    this.logger.log(
      `Assigning display ${uuid} to field: "${fieldId}"`
    )
    try {
      await this.database.setFieldId(uuid, fieldId)
    } catch {
      this.logger.warn(
        `Display with UUID "${uuid}" was not found`
      )
      throw new BadRequestException()
    }
    await this.onDisplayChange(uuid)
  }
}
