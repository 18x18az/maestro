import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { FieldState, FieldStatus, MATCH_STATE } from './simple.interface'
import { TimerService } from './timer.service'
import { FieldControlService } from './field-control.service'
import { SimpleRepo } from './simple.repo'
import { MatchService } from './match.service'

@Injectable()
export class MatchLifecycleService {
  private readonly logger = new Logger(MatchLifecycleService.name)

  constructor (
    private readonly fieldControl: FieldControlService,
    private readonly timer: TimerService,
    private readonly repo: SimpleRepo,
    private readonly match: MatchService
  ) {}

  async onAutoStarted (): Promise<void> {
    const match = await this.fieldControl.startAuto()

    if (match.match === undefined) throw new Error('No match')

    this.logger.log(`Match ${match.match.round}-${match.match.match}-${match.match.sitting} started`)
    await this.timer.startTimer(() => { void this.onPaused(match) }, match)
  }

  async onPaused (match: FieldStatus): Promise<void> {
    if (match.match === undefined) throw new BadRequestException('No match')
    this.timer.stopTimer()

    this.logger.log(`Match ${match.match.round}-${match.match.match}-${match.match.sitting} paused`)

    await this.fieldControl.updateFieldControl(FieldState.PAUSED)
  }

  async onMatchResumed (): Promise<void> {
    const match = await this.fieldControl.resumeMatch()

    if (match.match === undefined) throw new Error('No match')

    this.logger.log(`Match ${match.match.round}-${match.match.match}-${match.match.sitting} resumed`)
    await this.timer.startTimer(() => { void this.onMatchConcluded(match) }, match)
  }

  async onMatchConcluded (match: FieldStatus): Promise<void> {
    this.timer.stopTimer()
    if (match.match === undefined) throw new BadRequestException('No match')

    this.logger.log(`Match ${match.match.round}-${match.match.match}-${match.match.sitting} concluded`)

    await this.repo.updateMatchStatus(match.match, MATCH_STATE.SCORING)
    await this.fieldControl.updateFieldControl(FieldState.SCORING)
    await this.fieldControl.controlNextMatch()
  }

  async onMatchReplayed (match: FieldStatus): Promise<void> {
    if (match.match === undefined) throw new BadRequestException('No match')

    this.logger.log(`Match ${match.match.round}-${match.match.match}-${match.match.sitting} marked for a replay`)

    // TODO
  }

  async onMatchScored (match: FieldStatus): Promise<void> {
    if (match.match === undefined) throw new BadRequestException('No match')

    this.logger.log(`Match ${match.match.round}-${match.match.match}-${match.match.sitting} scored`)

    await this.onMatchResolved(match)
  }

  async onMatchResolved (match: FieldStatus): Promise<void> {
    await this.repo.updateMatchStatus(match.match, MATCH_STATE.RESOLVED)
    await this.match.queueField(match.id)
  }
}
