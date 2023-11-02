import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { EventStage, StageService } from '../stage'
import { FieldStatus, FieldState } from './field-control.interface'
import { FieldService } from '../field'
import { FieldControlPublisher } from './field-control.publisher'
import { MatchBlock, MatchService, ReplayStatus } from '../match'
import { makeReplayName } from '@/utils/string/match-name'
import { MatchResult } from '@/utils'
import { DisplayedResults, FieldDisplayService, ResultsDisplayService } from '../stream'

@Injectable()
export class FieldControlInternal {
  private readonly logger: Logger = new Logger(FieldControlInternal.name)

  private fields: FieldStatus[] = []
  private currentField: FieldStatus | null = null
  private timer: NodeJS.Timeout | null = null

  constructor (
    private readonly fieldInfo: FieldService,
    private readonly publisher: FieldControlPublisher,
    private readonly matches: MatchService,
    private readonly stage: StageService,
    private readonly results: ResultsDisplayService,
    private readonly display: FieldDisplayService
  ) {}

  async onApplicationBootstrap (): Promise<void> {
    const stage = this.stage.getStage()

    if (stage === EventStage.QUALIFICATIONS) {
      await this.initializeFields()
    }
  }

  private async initializeFields (): Promise<void> {
    const fields = await this.fieldInfo.getCompetitionFields()

    this.logger.log(`Initializing ${fields.length} fields`)

    this.fields = fields.map(field => ({
      field,
      state: FieldState.IDLE,
      match: null
    }))

    await this.updateAllFields()
  }

  async handleMatchResults (results: MatchResult[]): Promise<void> {
    // go through all the fields and see if they're awaiting scores, if so check if any of the results match
    for (const field of this.fields) {
      if (field.state !== FieldState.SCORING) {
        continue
      }

      if (field.match === null) {
        continue
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const result = results.find(result => result.identifier.matchNum === field.match!.matchNum && result.identifier.round === field.match!.round && result.identifier.sitting === field.match!.sitting)

      if (result === undefined) {
        continue
      }

      this.logger.log(`Match ${makeReplayName(field.match)} scored`)
      const displayResults: DisplayedResults = {
        match: field.match,
        redScore: result.redScore,
        blueScore: result.blueScore
      }
      this.results.setStagedResults(displayResults)
      const id = field.match.replayId
      field.match = null
      field.state = FieldState.IDLE
      await this.updateField(field)
      await this.matches.markScored(id)
    }
  }

  async handleStage (stage: EventStage): Promise<void> {
    if (stage === EventStage.WAITING_FOR_TEAMS) {
      this.fields = []
      this.currentField = null
      this.timer = null
    } else if (stage === EventStage.QUALIFICATIONS) {
      if (this.fields.length === 0) {
        await this.initializeFields()
      }
    }
  }

  async updateAllFields (): Promise<void> {
    for (const field of this.fields) {
      await this.publisher.publishFieldStatus(field)
    }
    await this.publisher.publishFieldStatuses(this.fields)
    await this.publisher.publishFieldControl(this.currentField)
  }

  async updateField (field: FieldStatus): Promise<void> {
    await this.publisher.publishFieldStatus(field)
    await this.publisher.publishFieldStatuses(this.fields)
  }

  async updateFieldControl (): Promise<void> {
    const status = this.currentField
    if (status !== null) {
      const field = this.fields.find(field => field.field.id === status.field.id)
      if (field !== undefined) {
        field.state = status.state
        field.match = status.match
        await this.updateField(field)
      }
    }
    await this.publisher.publishFieldControl(status)
  }

  async startMatch (): Promise<void> {
    if (this.currentField === null) {
      this.logger.warn('Tried to start match without a field')
      throw new BadRequestException('Cannot start match without a field')
    }
    if (this.currentField.state !== FieldState.ON_DECK) {
      this.logger.warn('Tried to start match without a match on deck')
      throw new BadRequestException('Cannot start match without a match on deck')
    }
    if (this.currentField.match === null) {
      this.logger.warn('Tried to start match without a match')
      throw new BadRequestException('Cannot start match without a match')
    }
    // end in 15 seconds
    const endTime = new Date()
    endTime.setSeconds(endTime.getSeconds() + 15)

    this.currentField.match.time = endTime.toISOString()
    this.currentField.state = FieldState.AUTO

    this.logger.log(`Starting match ${makeReplayName(this.currentField.match)}`)
    await this.updateFieldControl()

    const timeToEnd = endTime.getTime() - Date.now()
    this.timer = setTimeout(() => {
      void this.endAuto()
    }, timeToEnd)

    await this.display.readyScore(this.currentField.field.id)
  }

  async resumeMatch (): Promise<void> {
    if (this.currentField === null) {
      this.logger.warn('Tried to resume match without a field')
      throw new BadRequestException('Cannot resume match without a field')
    }
    if (this.currentField.state !== FieldState.PAUSED) {
      this.logger.warn('Tried to resume match without a match paused')
      throw new BadRequestException('Cannot resume match without a match paused')
    }
    if (this.currentField.match === null) {
      this.logger.warn('Tried to resume match without a match')
      throw new BadRequestException('Cannot resume match without a match')
    }
    // end in 105 seconds
    const endTime = new Date()
    endTime.setSeconds(endTime.getSeconds() + 105)

    this.currentField.match.time = endTime.toISOString()
    this.currentField.state = FieldState.DRIVER

    this.logger.log(`Resuming match ${makeReplayName(this.currentField.match)}`)
    await this.updateFieldControl()

    const timeToEnd = endTime.getTime() - Date.now()
    this.timer = setTimeout(() => {
      void this.endDriver()
    }, timeToEnd)
  }

  async endEarly (): Promise<void> {
    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }

    if (this.currentField === null) {
      this.logger.warn('Tried to end early without a field')
      throw new BadRequestException('Cannot end early without a field')
    }

    if (this.currentField.match === null) {
      this.logger.warn('Tried to end early without a match')
      throw new BadRequestException('Cannot end early without a match')
    }

    if (this.currentField.state !== FieldState.AUTO && this.currentField.state !== FieldState.DRIVER) {
      this.logger.warn('Tried to end early without a match in progress')
      throw new BadRequestException('Cannot end early without a match in progress')
    }

    this.logger.log(`Ending match ${makeReplayName(this.currentField.match)} early`)
    if (this.currentField.state === FieldState.AUTO) {
      await this.endAuto()
    } else {
      await this.endDriver()
    }
  }

  async endAuto (): Promise<void> {
    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }
    if (this.currentField === null) {
      this.logger.warn('Tried to end auto without a field')
      throw new BadRequestException('Cannot end auto without a field')
    }
    if (this.currentField.state !== FieldState.AUTO) {
      this.logger.warn('Tried to end auto without a match in auto')
      throw new BadRequestException('Cannot end auto without a match in auto')
    }
    if (this.currentField.match === null) {
      this.logger.warn('Tried to end auto without a match')
      throw new BadRequestException('Cannot end auto without a match')
    }
    this.logger.log(`Auto concluded for match ${makeReplayName(this.currentField.match)}`)
    this.currentField.state = FieldState.PAUSED
    this.currentField.match.time = undefined
    await this.updateFieldControl()
  }

  async endDriver (): Promise<void> {
    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }
    if (this.currentField === null) {
      this.logger.warn('Tried to end driver without a field')
      throw new BadRequestException('Cannot end driver without a field')
    }
    if (this.currentField.state !== FieldState.DRIVER) {
      this.logger.warn('Tried to end driver without a match in driver')
      throw new BadRequestException('Cannot end driver without a match in driver')
    }
    if (this.currentField.match === null) {
      this.logger.warn('Tried to end driver without a match')
      throw new BadRequestException('Cannot end driver without a match')
    }
    this.logger.log('Driver concluded')
    this.currentField.state = FieldState.SCORING
    this.currentField.match.time = undefined
    await this.updateFieldControl()
    await this.results.publishStagedResults()

    setTimeout(() => {
      void this.display.cut()
    }, 3000)

    const finishMatch = async (): Promise<void> => {
      if (this.currentField === null || this.currentField.match === null) return
      await this.matches.markPlayed(this.currentField.match.replayId)
      this.currentField = null
      await this.queueFieldControl()
    }

    setTimeout(() => {
      void finishMatch()
    }, 5000)
  }

  async cueNextBlock (): Promise<void> {
    if (await this.matches.isInBlock()) {
      this.logger.warn('Tried to cue block while block was in progress')
      throw new BadRequestException('Cannot cue next block while in a match')
    }

    this.logger.log('Cueing next block')
    const areMoreBlocks = await this.matches.cueNextBlock()
    // TODO handle false
    if (!areMoreBlocks) {
      console.warn('No more blocks to cue, handle this')
    }
  }

  async queueFieldControl (): Promise<void> {
    if (this.currentField !== null) {
      return
    }

    // find the field that is on deck with the lowest match id
    const onDeck = this.fields.filter(field => (field.state === FieldState.ON_DECK && field.match !== null))
    if (onDeck.length === 0) {
      return
    }

    // Explicitly don't check for null because typescript doesn't know that the filter above removes nulls
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const field = onDeck.reduce((a, b) => a.match!.id < b.match!.id ? a : b)

    this.logger.log(`Updating field control to ${field.field.name}`)
    this.currentField = field
    await this.publisher.publishFieldControl(field)
    await this.display.previewMatchOnField(field.field.id)
  }

  async handleCurrentBlockChange (block: MatchBlock | null): Promise<void> {
    if (block === null) {
      // TODO
      return
    }

    for (const field of this.fields) {
      if (field.match === null) {
        const match = block.matches.find(match => match.status !== ReplayStatus.RESOLVED && match.fieldId === field.field.id)
        if (match !== undefined) {
          this.logger.log(`Assigning match ${makeReplayName(match)} to field ${field.field.id}`)
          if (match.status === ReplayStatus.NOT_STARTED) {
            await this.matches.markOnDeck(match.replayId)
            field.state = FieldState.ON_DECK
          } else if (match.status === ReplayStatus.ON_DECK) {
            field.state = FieldState.ON_DECK
          } else if (match.status === ReplayStatus.AWAITING_SCORES) {
            field.state = FieldState.SCORING
          }
          field.match = match
          await this.updateField(field)
        }
      }
    }

    await this.queueFieldControl()
  }
}
