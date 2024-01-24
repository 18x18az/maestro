import { Injectable, Logger } from '@nestjs/common'
import { DisplayEntity } from './display.entity'
import { DisplayRepo } from './display.repo'

@Injectable()
export class DisplayService {
  private readonly logger = new Logger(DisplayService.name)

  constructor (private readonly repo: DisplayRepo) {}

  async registerDisplay (uuid: string): Promise<void> {
    this.logger.log(
      `Received registration request from display with UUID "${uuid}"`
    )
    // if (await this.database.getDisplay(uuid) === null) { await this.database.createDisplay(uuid) }
  }

  async adviseHasFieldControl (
    uuid: string,
    hasFieldControl: boolean
  ): Promise<void> {
    this.logger.log(
      `Display with UUID "${uuid}" has field control: ${String(hasFieldControl)}`
    )
  }

  async getDisplay (uuid: string): Promise<DisplayEntity> {
    const existing = await this.repo.getDisplay(uuid)

    if (existing !== null) return existing

    this.logger.log(`Registering display with UUID "${uuid}"`)
    return await this.repo.createDisplay(uuid)
  }

  async getDisplays (): Promise<DisplayEntity[]> {
    return await this.repo.getDisplays()
  }

  async setDisplayName (uuid: string, displayName: string): Promise<void> {
    this.logger.log(
      `Setting name of display ${uuid} to: "${displayName}"`
    )
    // try {
    //   await this.database.setDisplayName(uuid, displayName)
    // } catch {
    //   this.logger.warn(
    //     `Display with UUID "${uuid}" was not found`
    //   )
    //   throw new BadRequestException()
    // }
  }

  async assignFieldId (uuid: string, fieldId: number): Promise<void> {
    // this.logger.log(
    //   `Assigning display ${uuid} to field: "${fieldId}"`
    // )
    // try {
    //   await this.database.setFieldId(uuid, fieldId)
    // } catch {
    //   this.logger.warn(
    //     `Display with UUID "${uuid}" was not found`
    //   )
    //   throw new BadRequestException()
    // }
  }
}
