import { Injectable, Logger } from '@nestjs/common'
import { MatchRepo } from './match.repo'
import { MatchInternal } from './match.internal'
import { ReplayStatus } from './match.interface'
import { ElimsMatch } from '@/utils'
import { makeMatchName } from '@/utils/string/match-name'
import { FieldService } from '../field'

@Injectable()
export class MatchService {
  private readonly logger = new Logger(MatchService.name)

  constructor (
    private readonly repo: MatchRepo,
    private readonly service: MatchInternal,
    private readonly field: FieldService
  ) {}

  async isInBlock (): Promise<boolean> {
    const currentBlock = await this.repo.getCurrentBlock()

    return currentBlock !== null
  }

  async cueNextBlock (): Promise<boolean> {
    this.logger.log('Cueing next block')
    const nextBlock = await this.repo.cueNextBlock()

    if (nextBlock === null) {
      this.logger.log('No more blocks to cue')
      return false
    }

    this.logger.log(`Cued block ${nextBlock.id}`)
    await this.service.updateCurrentBlock(nextBlock)
    return true
  }

  async markOnDeck (replayId: number): Promise<void> {
    this.logger.log(`Marking replay ${replayId} as on deck`)
    await this.repo.setStatus(replayId, ReplayStatus.ON_DECK)
    await this.service.refreshCurrentBlock()
  }

  async markPlayed (replayId: number): Promise<void> {
    this.logger.log(`Marking replay ${replayId} as played`)
    await this.repo.setStatus(replayId, ReplayStatus.AWAITING_SCORES)
    await this.service.refreshCurrentBlock()
  }

  async markScored (replayId: number): Promise<void> {
    this.logger.log(`Marking replay ${replayId} as scored`)
    await this.repo.setStatus(replayId, ReplayStatus.RESOLVED)
    await this.service.refreshCurrentBlock()
  }

  async handleElimsMatches (matches: ElimsMatch[]): Promise<void> {
    for (const match of matches) {
      const exists = await this.repo.checkExists(match.identifier)
      if (exists) {
        continue
      }
      this.logger.log(`New match ${makeMatchName(match.identifier)}`)

      const block = await this.repo.getCurrentBlock()
      let blockId: number
      if (block === null) {
        this.logger.log('No elims block, creating')
        blockId = await this.repo.createBlock()
        await this.repo.cueNextBlock()
      } else {
        blockId = block.id
      }

      const matchId = await this.repo.createMatch({
        round: match.identifier.round,
        matchNum: match.identifier.matchNum,
        sitting: match.identifier.sitting,
        red: match.red,
        blue: match.blue
      })

      const allFields = await this.field.getCompetitionFields()

      let lastMatchFieldId = await this.repo.getFieldOfLastMatchOfBlock(blockId)
      if (lastMatchFieldId === null) {
        lastMatchFieldId = allFields[allFields.length - 1].id
      }

      const indexOfLastMatchField = allFields.findIndex((field) => field.id === lastMatchFieldId)
      const nextFieldIndex = (indexOfLastMatchField + 1) % allFields.length
      const nextField = allFields[nextFieldIndex]

      await this.repo.createScheduledMatch({
        blockId,
        matchId,
        fieldId: nextField.id,
        replay: 0
      })

      await this.service.refreshCurrentBlock()
    }
  }
}
