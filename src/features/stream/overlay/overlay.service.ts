import { Injectable } from '@nestjs/common'
import { StorageService } from '../../../utils/storage'
import { OverlayDisplayed } from './overlay.interface'

const OVERLAY_DISPLAYED = 'overlay-displayed'

@Injectable()
export class OverlayService {
  constructor (
    private readonly storage: StorageService
  ) {}

  async getDisplayed (): Promise<OverlayDisplayed> {
    return await this.storage.getEphemeral(OVERLAY_DISPLAYED, OverlayDisplayed.MATCH) as OverlayDisplayed
  }

  async setDisplayed (displayed: OverlayDisplayed): Promise<void> {
    await this.storage.setEphemeral(OVERLAY_DISPLAYED, displayed)
  }
}
