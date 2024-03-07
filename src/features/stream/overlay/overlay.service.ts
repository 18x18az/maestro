import { BadRequestException, Injectable } from '@nestjs/common'
import { StorageService } from '../../../utils/storage'
import { AwardStage, OverlayDisplayed } from './overlay.interface'
import { AwardEntity } from '../../award/award.entity'
import { AwardService } from '../../award/award.service'

const OVERLAY_DISPLAYED = 'overlay-displayed'

const DISPLAYED_AWARD = 'displayed-award'

@Injectable()
export class OverlayService {
  private awardStage: AwardStage = AwardStage.NONE

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
    this.awardStage = AwardStage.NONE
    await this.storage.setEphemeral(DISPLAYED_AWARD, awardId.toString())
  }

  private async clearAward (): Promise<void> {
    await this.storage.setEphemeral(DISPLAYED_AWARD, '')
  }

  getAwardStage (): AwardStage {
    return this.awardStage
  }

  async advanceAwardStage (): Promise<void> {
    switch (this.awardStage) {
      case AwardStage.NONE:
        if (await this.getAward() === null) throw new BadRequestException('No award selected')
        this.awardStage = AwardStage.INTRO
        break
      case AwardStage.INTRO:
        this.awardStage = AwardStage.REVEALED
        break
      case AwardStage.REVEALED:
        this.awardStage = AwardStage.NONE
        await this.clearAward()
        break
    }
  }
}
