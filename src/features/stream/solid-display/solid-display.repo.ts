import { Injectable, Logger } from '@nestjs/common'
import { StorageService } from '../../../utils/storage'

const SOLID_DISPLAY_KEY = 'solid-display'

@Injectable()
export class SolidDisplayRepo {
  private readonly logger: Logger = new Logger(SolidDisplayRepo.name)
  constructor (private readonly storage: StorageService) {}

  async getSolidDisplaySceneId (): Promise<number | undefined> {
    const stored = await this.storage.getPersistent(SOLID_DISPLAY_KEY, '')
    if (stored === '') return undefined

    const id = parseInt(stored, 10)

    return id
  }

  async setSolidDisplay (value: number): Promise<void> {
    this.logger.log(`Setting solid display to ${value}`)
    await this.storage.setPersistent(SOLID_DISPLAY_KEY, value.toString())
  }
}
