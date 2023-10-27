import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { FieldState, FieldStatus, MATCH_STATE } from './simple.interface'
import { TimerService } from './timer.service'
import { FieldControlService } from './field-control.service'
import { SimpleRepo } from './simple.repo'
import { MatchService } from './match.service'
import { ObsService } from './obs.service'
import { ResultsService } from './results.service'

enum STAGE {
  AUTO = 'AUTO',
  DRIVER = 'DRIVER',
  DISABLED = 'DISABLED'
}

@Injectable()
export class MatchLifecycleService {
  private readonly logger = new Logger(MatchLifecycleService.name)
  private stage: STAGE = STAGE.DISABLED
  private current: FieldStatus | null = null

  constructor (
    private readonly fieldControl: FieldControlService,
    private readonly timer: TimerService,
    private readonly repo: SimpleRepo,
    private readonly match: MatchService,
    private readonly obs: ObsService,
    private readonly results: ResultsService
  ) {}

  async onAutoStarted (): Promise<void> {
    const match = await this.fieldControl.startAuto()
    this.current = match

    if (match.match === undefined) throw new Error('No match')
    this.stage = STAGE.AUTO

    this.logger.log(`Match ${match.match.round}-${match.match.match}-${match.match.sitting} started`)
    this.timer.startTimer(() => { void this.onPaused(match) }, match)
  }

  async onPaused (match: FieldStatus): Promise<void> {
    this.current = match
    this.stage = STAGE.DISABLED
    if (match.match === undefined) throw new BadRequestException('No match')
    this.timer.stopTimer()

    this.logger.log(`Match ${match.match.round}-${match.match.match}-${match.match.sitting} paused`)

    await this.fieldControl.updateFieldControl(FieldState.PAUSED)
  }

  async endEarly (): Promise<void> {
    if (this.current === null) throw new BadRequestException('No match')

    if (this.stage === STAGE.AUTO) {
      await this.onPaused(this.current)
    } else if (this.stage === STAGE.DRIVER) {
      await this.onMatchConcluded(this.current)
    }
  }

  async onMatchResumed (): Promise<void> {
    const match = await this.fieldControl.resumeMatch()
    this.stage = STAGE.DRIVER

    if (match.match === undefined) throw new Error('No match')

    this.logger.log(`Match ${match.match.round}-${match.match.match}-${match.match.sitting} resumed`)
    this.timer.startTimer(() => { void this.onMatchConcluded(match) }, match)
  }

  async onMatchConcluded (match: FieldStatus): Promise<void> {
    this.current = match
    this.stage = STAGE.DISABLED
    this.timer.stopTimer()
    if (match.match === undefined) throw new BadRequestException('No match')

    this.logger.log(`Match ${match.match.round}-${match.match.match}-${match.match.sitting} concluded`)

    await this.repo.updateMatchStatus(match.match, MATCH_STATE.SCORING)

    await this.results.publishResults()

    const handleMatchEnd = async (): Promise<void> => {
      await this.fieldControl.controlNextMatch()
    }

    setTimeout(() => {
      void this.obs.triggerTransition()
    }, 3000)

    // TODO this is an ugly hacky way of ensuring that it doesn't immediately go to the next match, do this better
    setTimeout(() => {
      void handleMatchEnd()
    }, 5000)

    await this.fieldControl.updateFieldControl(FieldState.SCORING)
  }

  async onMatchReplayed (match: FieldStatus): Promise<void> {
    if (match.match === undefined) {
      this.logger.warn('Attempted to replay a match with no match identifier')
      throw new BadRequestException('No match')
    }

    const fieldToReplayOn = await this.repo.scheduleReplay(match)

    this.logger.log(`Match ${match.match.round}-${match.match.match}-${match.match.sitting} marked for a replay`)

    // check if the field is currently idle
    const status = this.fieldControl.getFieldStatus(fieldToReplayOn)

    if (status !== null && status.state === FieldState.IDLE) {
      await this.match.queueField(fieldToReplayOn)
    }

    await this.onMatchResolved(match)
  }

  async onMatchScored (match: FieldStatus): Promise<void> {
    if (match.match === undefined) throw new BadRequestException('No match')

    if (match.state !== FieldState.SCORING) throw new BadRequestException('Match not scoring')

    this.logger.log(`Match ${match.match.round}-${match.match.match}-${match.match.sitting} scored`)

    await this.onMatchResolved(match)
  }

  async onMatchResolved (match: FieldStatus): Promise<void> {
    await this.repo.updateMatchStatus(match.match, MATCH_STATE.RESOLVED)
    await this.match.queueField(match.id)
  }
}
