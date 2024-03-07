import { Injectable, Logger } from '@nestjs/common'
import { StorageService } from '../../../utils/storage'
import { SceneEntity } from '../switcher/scene.entity'
import { SwitcherService } from '../switcher/switcher.service'

const SOLID_DISPLAY_KEY = 'solid-display'

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
}
