import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { DisplaysPublisher } from './displays.publisher'
import { DisplaysDatabase } from './displays.repo'

@Injectable()
export class DisplaysService {
  private readonly logger = new Logger(DisplaysService.name)

  constructor (
    private readonly publisher: DisplaysPublisher,
    private readonly database: DisplaysDatabase
  ) {}

  async registerDisplay (uuid: string): Promise<void> {
    this.logger.log(
      `Received registration request from display with UUID ${uuid}`
    )
  }

  async adviseHasFieldControl (
    uuid: string,
    hasFieldControl: boolean
  ): Promise<void> {
    this.logger.log(
      `Display with UUID ${uuid} has field control: ${String(hasFieldControl)}`
    )
  }

  async setDisplayName (uuid: string, displayName: string): Promise<void> {
    this.logger.log(
      `Display with UUID ${uuid}'s name has been set to: ${displayName}`
    )
    try {
      await this.database.setDisplayName(uuid, displayName)
    } catch {
      this.logger.warn(
      `Display with UUID ${uuid}'s name failed to be set to: ${displayName}\nIs there a display with UUID ${uuid}?`
      )
      throw new BadRequestException()
    }
  }

  async assignFieldId (uuid: string, fieldId: string): Promise<void> {
    this.logger.log(
      `Display with UUID ${uuid} has been assigned to fieldId: ${fieldId}`
    )
    try {
      await this.database.setFieldId(uuid, fieldId)
    } catch {
      this.logger.warn(
        `Display with UUID ${uuid} failed to be assigned to fieldId: ${fieldId}\nIs there a display with UUID ${uuid}?`
      )
      throw new BadRequestException()
    }
    await this.publisher.publishDisplay(uuid, fieldId)
  }
}
