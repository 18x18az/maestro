import { BadRequestException, Injectable, Logger, Scope } from '@nestjs/common'
import { CompetitionFieldRepo } from './competition-field.repo'
import { Match, MatchService, MatchStatus } from '../match'
import { CompetitionFieldControlService } from './competition-field-control.service'
import { CompetitionFieldStatus, MATCH_STAGE } from './competition-field.interface'
import { FieldService } from '../field'
import { CompetitionFieldPublisher } from './competition-field.publisher'
import { VacancyService } from './vacancy.service'

@Injectable({ scope: Scope.REQUEST })
export class CompetitionFieldService {
  private readonly logger: Logger = new Logger(CompetitionFieldService.name)

  private onField: number | null | undefined
  private onDeck: number | null | undefined

  constructor (
    private readonly repo: CompetitionFieldRepo,
    private readonly matches: MatchService,
    private readonly control: CompetitionFieldControlService,
    private readonly field: FieldService,
    private readonly publisher: CompetitionFieldPublisher,
    private readonly vacancy: VacancyService
  ) {}

  private async getOnFieldMachInfo (fieldId: number): Promise<Match | null> {
    // If no match is on field, return null
    const onFieldId = await this.getOnFieldMatch(fieldId)
    if (onFieldId === null) {
      return null
    }

    // Get basic match info from the match service
    const match = await this.matches.getMatch(onFieldId)
    return match
  }

  private async bustCache (fieldId: number): Promise<void> {
    await this.getOnFieldMatch(fieldId, true)
    await this.getOnDeckMatch(fieldId, true)
  }

  private async getOnDeckMatchInfo (fieldId: number): Promise<Match | null> {
    // If no match is on deck, return null
    const onDeckId = await this.getOnDeckMatch(fieldId)
    if (onDeckId === null) {
      return null
    }

    // Get basic match info from the match service
    const match = await this.matches.getMatch(onDeckId)
    return match
  }

  async getOnFieldMatchStage (fieldId: number): Promise<MATCH_STAGE> {
    return await this.control.get(fieldId)
  }

  async isActive (fieldId: number): Promise<boolean> {
    return await this.control.isActive(fieldId)
  }

  async noLongerActiveField (fieldId: number): Promise<void> {
    if (await this.isActive(fieldId)) {
      this.logger.warn(`Field ${fieldId} is still active`)
      throw new BadRequestException(`Field ${fieldId} is still active`)
    }

    const currentStatus = await this.getOnFieldMatchStage(fieldId)
    if (currentStatus === MATCH_STAGE.OUTRO) {
      await this.control.onOutroEnd(fieldId)
    }
    await this.publish(fieldId)
  }

  private async publish (fieldId: number): Promise<void> {
    const payload: CompetitionFieldStatus = {
      field: await this.field.getField(fieldId),
      onDeck: await this.getOnDeckMatchInfo(fieldId),
      onField: await this.getOnFieldMachInfo(fieldId),
      stage: await this.getOnFieldMatchStage(fieldId)
    }

    await this.publisher.publishFieldStatus(fieldId, payload)
    await this.vacancy.onFieldUpdate(fieldId)
  }

  private async republish (fieldId: number): Promise<void> {
    await this.bustCache(fieldId)
    await this.publish(fieldId)
  }

  private async getOnDeckMatch (fieldId: number, bustCache: boolean = false): Promise<number | null> {
    // If the on deck match is already cached, return it
    if (this.onDeck !== undefined && !bustCache) {
      return this.onDeck
    }

    // Otherwise, get the match from the database and cache it
    const match = await this.repo.getMatchOnDeck(fieldId)
    this.onDeck = match
    return match
  }

  private async getOnFieldMatch (fieldId: number, bustCache: boolean = false): Promise<number | null> {
    // If the on field match is already cached, return it
    if (this.onField !== undefined && !bustCache) {
      return this.onField
    }

    // Otherwise, get the match from the database and cache it
    const match = await this.repo.getMatchOnField(fieldId)
    this.onField = match
    return match
  }

  private async putOnField (fieldId: number, matchId: number): Promise<void> {
    // Make sure there is not already a match on field
    const onField = await this.getOnFieldMatch(fieldId)
    if (onField !== null) {
      throw new Error(`Field ${fieldId} already has a match on field`)
    }

    // Put the match on field and mark it as queued
    this.logger.log(`Putting match ${matchId} on field ${fieldId}`)
    await this.repo.putOnField(fieldId, matchId)
    this.onField = matchId
    await this.matches.markQueued(matchId)

    // Publish the new field status
    await this.publish(fieldId)
  }

  private async putOnDeck (fieldId: number, matchId: number): Promise<void> {
    // Make sure there is not already a match on deck
    const onDeck = await this.getOnDeckMatch(fieldId)
    if (onDeck !== null) {
      throw new Error(`Field ${fieldId} already has a match on deck`)
    }

    // Put the match on deck and mark it as queued
    this.logger.log(`Putting match ${matchId} on deck for field ${fieldId}`)
    await this.repo.putOnDeck(fieldId, matchId)
    this.onDeck = matchId
    await this.matches.markQueued(matchId)

    // Publish the new field status
    await this.publish(fieldId)
  }

  private async fieldCanQueue (fieldId: number): Promise<boolean> {
    // Make sure there is a gap to queue the match into
    const onField = await this.getOnFieldMatch(fieldId)
    const onDeck = await this.getOnDeckMatch(fieldId)

    return onField === null || onDeck === null
  }

  private async matchIsOnField (fieldId: number): Promise<boolean> {
    return await this.getOnFieldMatch(fieldId) !== null
  }

  async queueMatch (fieldId: number, matchId: number): Promise<void> {
    this.logger.log(`Queueing match ${matchId} on field ${fieldId}`)

    // Make sure the match can be queued
    if (!await this.matches.canBeQueued(matchId)) {
      this.logger.warn(`Match ${matchId} cannot be queued`)
      throw new BadRequestException(`Match ${matchId} cannot be queued`)
    }

    // Make sure the field can be queued
    if (!await this.fieldCanQueue(fieldId)) {
      this.logger.warn(`Field ${fieldId} already has a match on field and on deck`)
      throw new BadRequestException(`Field ${fieldId} already has a match on field and on deck`)
    }

    // If there is no match on field, put the match on field, otherwise put it on deck
    if (await this.matchIsOnField(fieldId)) {
      await this.putOnDeck(fieldId, matchId)
    } else {
      await this.putOnField(fieldId, matchId)
    }
  }

  async resolveMatchOnField (fieldId: number, resolution: MatchStatus): Promise<void> {
    this.logger.log(`Clearing field ${fieldId}`)

    // Make sure there is a match on field to resolve
    const onField = await this.getOnFieldMatch(fieldId)
    if (onField === null) {
      this.logger.warn(`Field ${fieldId} has no match on field`)
      throw new BadRequestException(`Field ${fieldId} has no match on field`)
    }

    // Resolve the match on the field and remove it from the on field slot
    await this.matches.resolveMatch(onField, resolution)
    await this.repo.removeOnField(fieldId)
    this.onField = null

    // If no match is on deck, publish the new field status and return
    const onDeck = await this.getOnDeckMatch(fieldId)
    if (onDeck === null) {
      await this.publish(fieldId)
      return
    }

    // Otherwise, move the match on deck onto the field and publish the new field status
    this.logger.log(`Moving match ${onDeck} from on deck to on field`)
    await this.repo.moveOnDeckToOnField(fieldId)
    this.onField = onDeck
    this.onDeck = null
    await this.publish(fieldId)
  }

  async removeMatchOnDeck (fieldId: number): Promise<void> {
    this.logger.log(`Removing match on deck on field ${fieldId}`)

    // Make sure there is a match on deck to remove
    const onDeck = await this.getOnDeckMatch(fieldId)
    if (onDeck === null) {
      this.logger.warn(`Field ${fieldId} has no match on deck`)
      throw new BadRequestException(`Field ${fieldId} has no match on deck`)
    }

    // Unmark the match as queued and remove it from the on deck slot
    await this.matches.unmarkQueued(onDeck)
    await this.repo.removeOnDeck(fieldId)
    this.onDeck = null

    // Publish the new field status
    await this.publish(fieldId)
  }

  async replayMatch (matchId: number): Promise<void> {
    this.logger.log(`Marking match ${matchId} for replay`)

    // Make sure the match has either been queued or is currently being scored
    const status = await this.matches.getMatchStatus(matchId)
    if (status !== MatchStatus.SCORING && status !== MatchStatus.QUEUED) {
      this.logger.warn(`Match ${matchId} is not queued or scoring`)
      throw new BadRequestException(`Match ${matchId} is not queued or scoring`)
    }

    // Get the field ID and location of the match
    const { fieldId, location } = await this.repo.getMatchLocation(matchId)

    // If the match is on on deck, it cannot be marked for replay yet
    if (location === 'ON_DECK') {
      this.logger.warn(`Match ${matchId} is still on deck and cannot be marked for replay`)
      throw new BadRequestException(`Match ${matchId} is still on deck and cannot be marked for replay`)
    }

    // Otherwise resolve it as NEEDS_REPLAY
    await this.resolveMatchOnField(fieldId, MatchStatus.NEEDS_REPLAY)
  }

  async removeMatch (matchId: number): Promise<void> {
    this.logger.log(`Unqueueing match ${matchId}`)

    // Make sure the match is marked as queued and can therefore be unqueued
    const status = await this.matches.getMatchStatus(matchId)
    if (status !== MatchStatus.QUEUED) {
      this.logger.warn(`Match ${matchId} is not queued`)
      throw new BadRequestException(`Match ${matchId} is not marked as queued`)
    }

    // Get the field ID and location of the match
    const { fieldId, location } = await this.repo.getMatchLocation(matchId)

    // If the match is on deck, remove it from the on deck slot, otherwise resolve it as not started
    if (location === 'ON_DECK') {
      await this.removeMatchOnDeck(fieldId)
    } else {
      await this.resolveMatchOnField(fieldId, MatchStatus.NOT_STARTED)
    }
  }

  async readyAutonomous (fieldId: number): Promise<void> {
    this.logger.log(`Loading autonomous on field ${fieldId}`)
    await this.control.putOnDeck(fieldId)
    await this.publish(fieldId)
  }

  async startAutonomous (fieldId: number): Promise<void> {
    this.logger.log(`Starting autonomous on field ${fieldId}`)
    await this.control.startAuto(fieldId, this.republish.bind(this))
    await this.publish(fieldId)
  }

  async endAutonomous (fieldId: number): Promise<void> {
    this.logger.log(`Ending autonomous on field ${fieldId}`)
    await this.control.endAutoEarly(fieldId)
  }

  async startDriver (fieldId: number): Promise<void> {
    this.logger.log(`Starting driver on field ${fieldId}`)
    await this.control.startDriver(fieldId, this.republish.bind(this))
    await this.publish(fieldId)
  }

  async endDriver (fieldId: number): Promise<void> {
    this.logger.log(`Ending driver on field ${fieldId}`)
    await this.control.endDriverEarly(fieldId)
  }
}
