import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { CompetitionFieldRepo } from './competition-field.repo'
import { Match, MatchService, MatchStatus } from '../match'
import { CompetitionFieldControlService } from './competition-field-control.service'
import { CompetitionFieldStatus, MATCH_STAGE } from './competition-field.interface'
import { CompetitionFieldPublisher } from './competition-field.publisher'
import { VacancyService } from './vacancy.service'
import { FieldService } from '@/features/field'
import { LifecycleService } from './lifecyle.service'

@Injectable()
export class CompetitionFieldService {
  private readonly logger: Logger = new Logger(CompetitionFieldService.name)

  constructor (
    private readonly repo: CompetitionFieldRepo,
    private readonly matches: MatchService,
    private readonly control: CompetitionFieldControlService,
    private readonly field: FieldService,
    private readonly publisher: CompetitionFieldPublisher,
    private readonly vacancy: VacancyService,
    private readonly persistence: LifecycleService
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

  private async getOnTableMatchInfo (fieldId: number): Promise<Match | null> {
    // If no match is on deck, return null
    const onDeckId = await this.getOnTableMatch(fieldId)
    if (onDeckId === null) {
      return null
    }

    // Get basic match info from the match service
    const match = await this.matches.getMatch(onDeckId)
    return match
  }

  async getMatchStage (fieldId: number): Promise<MATCH_STAGE> {
    return await this.control.get(fieldId)
  }

  async isActive (fieldId: number): Promise<boolean> {
    return await this.control.isActive(fieldId)
  }

  async noLongerLiveField (fieldId: number): Promise<void> {
    if (await this.isActive(fieldId)) {
      this.logger.warn(`Field ${fieldId} is still active`)
      throw new BadRequestException(`Field ${fieldId} is still active`)
    }

    const currentStatus = await this.getMatchStage(fieldId)
    if (currentStatus === MATCH_STAGE.OUTRO) {
      this.logger.log('Closing out outro')
      await this.control.onOutroEnd(fieldId)
    }
    await this.publish(fieldId)
  }

  private async publish (fieldId: number): Promise<void> {
    const payload: CompetitionFieldStatus = {
      field: await this.field.getField(fieldId),
      onDeck: await this.getOnTableMatchInfo(fieldId),
      onField: await this.getOnFieldMachInfo(fieldId),
      stage: await this.getMatchStage(fieldId)
    }

    await this.publisher.publishFieldStatus(fieldId, payload)
    await this.vacancy.onFieldUpdate(fieldId)
  }

  private async getOnTableMatch (fieldId: number): Promise<number | null> {
    return await this.repo.getMatchOnDeck(fieldId)
  }

  private async getOnFieldMatch (fieldId: number): Promise<number | null> {
    return await this.repo.getMatchOnField(fieldId)
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
    await this.matches.markQueued(matchId)

    // Publish the new field status
    await this.publish(fieldId)
  }

  private async putOnDeck (fieldId: number, matchId: number): Promise<void> {
    // Make sure there is not already a match on deck
    const onDeck = await this.getOnTableMatch(fieldId)
    if (onDeck !== null) {
      throw new Error(`Field ${fieldId} already has a match on deck`)
    }

    // Put the match on deck and mark it as queued
    this.logger.log(`Putting match ${matchId} on deck for field ${fieldId}`)
    await this.repo.putOnDeck(fieldId, matchId)
    await this.matches.markQueued(matchId)

    // Publish the new field status
    await this.publish(fieldId)
  }

  private async fieldCanQueue (fieldId: number): Promise<boolean> {
    // Make sure there is a gap to queue the match into
    const onField = await this.getOnFieldMatch(fieldId)
    const onDeck = await this.getOnTableMatch(fieldId)

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

  private async queueNextMatch (fieldId: number): Promise<boolean> {
    if (!this.persistence.isAutomationEnabled()) {
      return false
    }
    const unqueued = await this.matches.getUnqueuedMatches()
    const firstEligible = unqueued.find((match) => {
      return match.fieldId === undefined || match.fieldId === fieldId
    })

    if (firstEligible === undefined) {
      return false
    }

    await this.queueMatch(fieldId, firstEligible.id)
    return true
  }

  async fillField (fieldId: number): Promise<void> {
    this.logger.log(`Ensuring field ${fieldId} is filled`)
    const onTable = await this.getOnTableMatch(fieldId)
    if (onTable === null) {
      const didFillNextMatch = await this.queueNextMatch(fieldId)

      if (didFillNextMatch) {
        await this.fillField(fieldId)
      }
    }
  }

  async fillAllFields (): Promise<void> {
    if (!this.persistence.isAutomationEnabled()) {
      return
    }

    this.logger.log('Filling all fields')
    const fields = await this.field.getCompetitionFields()

    for (const field of fields) {
      await this.fillField(field.id)
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

    // If no match is on deck, publish the new field status and return
    const onDeck = await this.getOnTableMatch(fieldId)
    if (onDeck === null) {
      await this.publish(fieldId)
      return
    }

    // Otherwise, move the match on deck onto the field and publish the new field status
    this.logger.log(`Moving match ${onDeck} from on deck to on field`)
    await this.repo.moveOnDeckToOnField(fieldId)

    const didQueueNextMatch = await this.queueNextMatch(fieldId)

    // Didn't have a next match to queue so manually publish the removal
    if (!didQueueNextMatch) {
      await this.publish(fieldId)
    }
  }

  async removeMatchOnDeck (fieldId: number): Promise<void> {
    this.logger.log(`Removing match on deck on field ${fieldId}`)

    // Make sure there is a match on deck to remove
    const onDeck = await this.getOnTableMatch(fieldId)
    if (onDeck === null) {
      this.logger.warn(`Field ${fieldId} has no match on deck`)
      throw new BadRequestException(`Field ${fieldId} has no match on deck`)
    }

    // Unmark the match as queued and remove it from the on deck slot
    await this.matches.unmarkQueued(onDeck)
    await this.repo.removeOnDeck(fieldId)

    // Publish the new field status
    await this.publish(fieldId)
  }

  async replayMatch (matchId: number): Promise<number> {
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

    return fieldId
  }

  async matchScored (matchId: number): Promise<void> {
    const { fieldId, location } = await this.repo.getMatchLocation(matchId)

    if (location === 'ON_DECK') {
      throw new Error('Scored match that was on deck')
    } else {
      await this.resolveMatchOnField(fieldId, MatchStatus.COMPLETE)
    }
  }

  async removeMatch (matchId: number): Promise<number> {
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

    return fieldId
  }

  async readyAutonomous (fieldId: number): Promise<void> {
    this.logger.log(`Loading autonomous on field ${fieldId}`)
    await this.control.putOnDeck(fieldId)
    await this.publish(fieldId)
  }

  async startAutonomous (fieldId: number): Promise<void> {
    this.logger.log(`Starting autonomous on field ${fieldId}`)
    await this.control.startAuto(fieldId, this.publish.bind(this))
    await this.publish(fieldId)
  }

  async endAutonomous (fieldId: number): Promise<void> {
    this.logger.log(`Ending autonomous on field ${fieldId}`)
    await this.control.endAutoEarly(fieldId)
  }

  async startDriver (fieldId: number, endCb?: (fieldId: number) => Promise<void>): Promise<void> {
    this.logger.log(`Starting driver on field ${fieldId}`)
    await this.control.startDriver(fieldId, async () => {
      await this.publish(fieldId)
      if (endCb !== undefined) await endCb(fieldId)
    })
    await this.publish(fieldId)
  }

  async endDriver (fieldId: number): Promise<void> {
    this.logger.log(`Ending driver on field ${fieldId}`)
    await this.control.endDriverEarly(fieldId)
  }

  async getNextOnDeckField (fieldId: number): Promise<number | null> {
    this.logger.log('Checking if next field is ready to be queued')
    const nextField = await this.field.getNextField(fieldId)
    this.logger.log(`Next field is ${nextField.name}`)
    const info = await this.getOnFieldMachInfo(nextField.id)
    if (info === null) {
      this.logger.log('No match queued on field')
      return null
    }

    return nextField.id
  }
}
