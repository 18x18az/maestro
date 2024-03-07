import { Injectable } from '@nestjs/common'
import { StorageService } from '../../../utils/storage'
import { OverlayDisplayed } from './overlay.interface'
import { AwardEntity } from '../../award/award.entity'
import { AwardService } from '../../award/award.service'

const OVERLAY_DISPLAYED = 'overlay-displayed'

const DISPLAYED_AWARD = 'displayed-award'

@Injectable()
export class OverlayService {
  constructor (
    private readonly storage: StorageService,
    private readonly award: AwardService
  ) {}

  async getDisplayed (): Promise<OverlayDisplayed> {
    return await this.storage.getEphemeral(OVERLAY_DISPLAYED, OverlayDisplayed.MATCH) as OverlayDisplayed
  }

  async setDisplayed (displayed: OverlayDisplayed): Promise<void> {
    await this.storage.setEphemeral(OVERLAY_DISPLAYED, displayed)
  }

  async getAward (): Promise<AwardEntity | null> {
    const awardIdString = await this.storage.getEphemeral(DISPLAYED_AWARD, '')
    if (awardIdString === '') return null
    const awardId = parseInt(awardIdString)
    return await this.award.getAward(awardId)
  }

  async setAward (awardId: number): Promise<void> {
    await this.storage.setEphemeral(DISPLAYED_AWARD, awardId.toString())
  }
}
