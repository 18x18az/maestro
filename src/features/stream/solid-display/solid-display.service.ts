import { Injectable, Logger } from '@nestjs/common'
import { StorageService } from '../../../utils/storage'
import { SceneEntity } from '../switcher/scene.entity'
import { SwitcherService } from '../switcher/switcher.service'
import { SolidDisplayDisplayed } from './solid-display.interface'

const SOLID_DISPLAY_KEY = 'solid-display'
const SOLID_DISPLAY_DISPLAYED_KEY = 'solid-display-displayed'

@Injectable()
export class SolidDisplayService {
  private readonly logger: Logger = new Logger(SolidDisplayService.name)
  constructor (
    private readonly storageService: StorageService,
    private readonly switcher: SwitcherService
  ) {}

  async getSolidDisplayScene (): Promise<SceneEntity | undefined> {
    const stored = await this.storageService.getPersistent(SOLID_DISPLAY_KEY, '')
    if (stored === '') return undefined

    const id = parseInt(stored, 10)

    const scene = await this.switcher.findOne(id)
    return scene
  }

  async setSolidDisplay (value: number): Promise<void> {
    this.logger.log(`Setting solid display to ${value}`)
    await this.storageService.setPersistent(SOLID_DISPLAY_KEY, value.toString())
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
