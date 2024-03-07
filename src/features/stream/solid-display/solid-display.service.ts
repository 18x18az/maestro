import { Injectable, Logger } from '@nestjs/common'
import { StorageService } from '../../../utils/storage'
import { SceneEntity } from '../switcher/scene.entity'
import { SwitcherService } from '../switcher/switcher.service'
import { SolidDisplayDisplayed } from './solid-display.interface'
import { SolidDisplayRepo } from './solid-display.repo'

const SOLID_DISPLAY_DISPLAYED_KEY = 'solid-display-displayed'

@Injectable()
export class SolidDisplayService {
  private readonly logger: Logger = new Logger(SolidDisplayService.name)
  constructor (
    private readonly storageService: StorageService,
    private readonly repo: SolidDisplayRepo,
    private readonly switcher: SwitcherService
  ) {}

  async getSolidDisplayScene (): Promise<SceneEntity | undefined> {
    const id = await this.repo.getSolidDisplaySceneId()

    if (id === undefined) return undefined

    return await this.switcher.findOne(id)
  }

  async getDisplayed (): Promise<SolidDisplayDisplayed> {
    const stored = await this.storageService.getEphemeral(SOLID_DISPLAY_DISPLAYED_KEY, SolidDisplayDisplayed.INSPECTION)
    return stored as SolidDisplayDisplayed
  }

  async setDisplayed (value: SolidDisplayDisplayed): Promise<void> {
    this.logger.log(`Setting solid display to ${value}`)
    await this.storageService.setEphemeral(SOLID_DISPLAY_DISPLAYED_KEY, value)
  }
}
