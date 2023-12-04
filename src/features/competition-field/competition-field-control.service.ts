import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { MATCH_STAGE } from './competition-field.interface'
import { CompetitionFieldRepo } from './competition-field.repo'
import { MatchService, MatchStatus } from '../match'
import { FieldControlService } from '../field-control'
import { CONTROL_MODE } from '../field-control/field-control.interface'

@Injectable()
export class CompetitionFieldControlService {
  private readonly logger: Logger = new Logger(CompetitionFieldControlService.name)

  private readonly cache: Map<number, MATCH_STAGE> = new Map()

  constructor (
    private readonly repo: CompetitionFieldRepo,
    private readonly matches: MatchService,
    private readonly control: FieldControlService
  ) {}

  async remove (fieldId: number): Promise<void> {
    // Cannot remove a field that is not in the cache
    const cached = this.cache.get(fieldId)
    if (cached === undefined) {
      throw new Error(`field ${fieldId} not in cache`)
    }

    // Cannot remove a field that is in the middle of a match
    if (cached === MATCH_STAGE.AUTON || cached === MATCH_STAGE.DRIVER) {
      throw new Error(`field ${fieldId} is in a match`)
    }

    // Remove the field from the cache
    this.cache.delete(fieldId)
  }

  private async canPutOnDeck (fieldId: number): Promise<boolean> {
    // Ensure either auto hasn't started yet or it needs to be restarted
    const current = await this.get(fieldId)
    if (current !== MATCH_STAGE.QUEUED && current !== MATCH_STAGE.SCORING_AUTON) {
      this.logger.log(`field ${fieldId} is not queued or scoring auton`)
      return false
    }

    return true
  }

  async putOnDeck (fieldId: number): Promise<void> {
    if (!await this.canPutOnDeck(fieldId)) {
      throw new Error(`cannot put field ${fieldId} on deck`)
    }

    // If there is a cached value because auto is being restarted, remove it
    this.cache.delete(fieldId)

    // Load the field with a 15 second auton timer
    await this.control.load(fieldId, CONTROL_MODE.AUTO, 15 * 1000)
  }

  async canStartAuto (fieldId: number): Promise<boolean> {
    // Ensure that auto is loaded and ready to go
    const current = await this.get(fieldId)
    if (current !== MATCH_STAGE.QUEUED) {
      this.logger.log(`field ${fieldId} is not ready to start auto`)
      return false
    }

    return true
  }

  async startAuto (fieldId: number, endCb?: (fieldId: number) => Promise<void>): Promise<void> {
    if (!await this.canStartAuto(fieldId)) {
      this.logger.warn(`cannot start auto on field ${fieldId}`)
      throw new BadRequestException(`cannot start auto on field ${fieldId}`)
    }

    await this.control.start(fieldId, async () => {
      await this.onAutoEnd(fieldId)
      if (endCb !== undefined) {
        await endCb(fieldId)
      }
    })
    this.cache.set(fieldId, MATCH_STAGE.AUTON)
  }

  async canEndAuto (fieldId: number): Promise<boolean> {
    const current = await this.get(fieldId)
    if (current !== MATCH_STAGE.AUTON) {
      this.logger.log(`field ${fieldId} is not in auton`)
      return false
    }
    return true
  }

  private async onAutoEnd (fieldId: number): Promise<void> {
    if (!await this.canEndAuto(fieldId)) {
      this.logger.warn(`cannot end auto on field ${fieldId}`)
      throw new Error(`cannot end auto on field ${fieldId}`)
    }

    await this.control.load(fieldId, CONTROL_MODE.DRIVER, 105 * 1000)
    this.cache.set(fieldId, MATCH_STAGE.SCORING_AUTON)
  }

  async endAutoEarly (fieldId: number): Promise<void> {
    if (!await this.canEndAuto(fieldId)) {
      throw new BadRequestException(`cannot end auto on field ${fieldId}`)
    }

    await this.control.stop(fieldId)
  }

  async canStartDriver (fieldId: number): Promise<boolean> {
    // Ensure that driver is loaded and ready to go
    const current = await this.get(fieldId)
    if (current !== MATCH_STAGE.SCORING_AUTON) {
      this.logger.log(`field ${fieldId} is not scoring auton`)
      return false
    }

    return true
  }

  async startDriver (fieldId: number, endCb?: (fieldId: number) => Promise<void>): Promise<void> {
    if (!await this.canStartDriver(fieldId)) {
      this.logger.warn(`cannot start driver on field ${fieldId}`)
      throw new BadRequestException(`cannot start driver on field ${fieldId}`)
    }

    await this.control.start(fieldId, async () => {
      await this.onDriverEnd(fieldId)
      if (endCb !== undefined) {
        await endCb(fieldId)
      }
    })
    this.cache.set(fieldId, MATCH_STAGE.DRIVER)
  }

  async canEndDriver (fieldId: number): Promise<boolean> {
    const current = await this.get(fieldId)

    if (current !== MATCH_STAGE.DRIVER) {
      this.logger.log(`field ${fieldId} is not in driver`)
      return false
    }

    return true
  }

  private async onDriverEnd (fieldId: number): Promise<void> {
    if (!await this.canEndDriver(fieldId)) {
      throw new Error(`cannot end driver on field ${fieldId}`)
    }

    this.cache.set(fieldId, MATCH_STAGE.OUTRO)
    const matchOnField = await this.repo.getMatchOnField(fieldId)
    if (matchOnField === null) {
      throw new Error(`no match on field ${fieldId} but it ended`)
    }
    await this.matches.markPlayed(matchOnField)
  }

  async onOutroEnd (fieldId: number): Promise<void> {
    if (await this.get(fieldId) !== MATCH_STAGE.OUTRO) {
      throw new Error(`field ${fieldId} is not in outro`)
    }

    await this.remove(fieldId)
  }

  async endDriverEarly (fieldId: number): Promise<void> {
    if (!await this.canEndDriver(fieldId)) {
      throw new BadRequestException(`cannot end driver on field ${fieldId}`)
    }

    await this.control.stop(fieldId)
  }

  async get (fieldId: number): Promise<MATCH_STAGE> {
    // If there is no match on the field, return empty
    const onFieldMatchId = await this.repo.getMatchOnField(fieldId)
    if (onFieldMatchId === null) {
      return MATCH_STAGE.EMPTY
    }

    // If there is a cached stage, return it
    const cached = this.cache.get(fieldId)
    if (cached !== undefined) {
      return cached
    }

    // Otherwise, determine stage from the database
    const baseStatus = await this.matches.getMatchStatus(onFieldMatchId)
    switch (baseStatus) {
      case MatchStatus.QUEUED:
        return MATCH_STAGE.QUEUED
      case MatchStatus.SCORING:
        return MATCH_STAGE.SCORING
    }

    throw new Error(`match with status ${baseStatus} should not be on field`)
  }

  async isActive (fieldId: number): Promise<boolean> {
    const stage = await this.get(fieldId)
    return stage === MATCH_STAGE.AUTON || stage === MATCH_STAGE.DRIVER || stage === MATCH_STAGE.SCORING_AUTON
  }

  async isRunning (fieldId: number): Promise<boolean> {
    return await this.control.isRunning(fieldId)
  }
}
