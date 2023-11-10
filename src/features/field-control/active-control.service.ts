import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { FieldState, FieldStatus } from './field-control.interface'
import { FieldControlPublisher } from './field-control.publisher'
import { FieldStatusService } from './field-status.service'
import { MatchManager } from './match-manager.service'

@Injectable()
export class ActiveService {
  private active: FieldStatus | null = null
  private timer: NodeJS.Timeout | null = null
  private onDeck: FieldStatus | null = null

  private readonly logger: Logger = new Logger(ActiveService.name)

  constructor (
    private readonly publisher: FieldControlPublisher,
    private readonly status: FieldStatusService,
    private readonly manager: MatchManager
  ) {}

  activeIsOnField (fieldId: number): boolean {
    return this.active !== null && this.active.field.id === fieldId
  }

  onDeckIsOnField (fieldId: number): boolean {
    return this.onDeck !== null && this.onDeck.field.id === fieldId
  }

  async setActive (status: FieldStatus | null): Promise<void> {
    this.active = status
    await this.publisher.publishActiveField(this.active)
    if (status !== null) {
      await this.publisher.publishFieldStatus(status)
    }
  }

  async setOnDeck (status: FieldStatus | null): Promise<void> {
    this.onDeck = status
    await this.publisher.publishNextField(this.onDeck)
    if (status !== null) {
      await this.publisher.publishFieldStatus(status)
    }
  }

  async markNext (field: number): Promise<void> {
    this.logger.log(`Marking field ID ${field} as next`)
    const status = await this.status.get(field)

    if (status.match === null) {
      this.logger.warn(`Field ID ${field} has no match`)
      throw new BadRequestException(`Field ID ${field} has no match`)
    }

    await this.setOnDeck(status)
  }

  async pushActive (): Promise<void> {
    if (this.onDeck === null) {
      this.logger.warn('No field marked as next')
      throw new BadRequestException('No field marked as next')
    }

    this.logger.log(`Pushing field ${this.onDeck.field.name} to active`)

    await this.setActive(this.onDeck)

    await this.publisher.publishActiveField(this.active)
    const allFields = await this.status.getAll()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const activeFieldIndex = allFields.findIndex(field => field.field.id === this.active!.field.id)
    const nextFieldIndex = (activeFieldIndex + 1) % allFields.length
    if (allFields[nextFieldIndex].match !== null) {
      await this.markNext(allFields[nextFieldIndex].field.id)
    } else {
      await this.setOnDeck(null)
    }
  }

  async clearActive (): Promise<void> {
    if (this.active === null) {
      this.logger.warn('No field marked as active')
      throw new BadRequestException('No field marked as active')
    }

    this.logger.log(`Clearing active field ${this.active.field.name}`)

    await this.setActive(null)
  }

  async start (): Promise<void> {
    if (this.active === null || this.active.match === null) {
      this.logger.warn('No field marked as active')
      throw new BadRequestException('No field marked as active')
    }

    const state = this.active.state

    if (state !== FieldState.IDLE && state !== FieldState.PAUSED) {
      this.logger.warn(`Field ${this.active.field.name} is not on deck or paused`)
      throw new BadRequestException(`Field ${this.active.field.name} is not on deck or paused`)
    }

    if (state === FieldState.IDLE) {
      this.logger.log(`Starting autonomous on field ${this.active.field.name}`)
      this.active.endTime = new Date(Date.now() + 15000).toISOString()
      this.active.state = FieldState.AUTO
    } else {
      this.logger.log(`Resuming match on field ${this.active.field.name}`)
      this.active.endTime = new Date(Date.now() + 105000).toISOString()
      this.active.state = FieldState.DRIVER
    }

    await this.setActive(this.active)

    const timeToEnd = new Date(this.active.endTime).getTime() - Date.now()
    this.timer = setTimeout(() => {
      void this.endMatchSection()
    }, timeToEnd)
  }

  async endMatchSection (): Promise<void> {
    if (this.active === null || this.active.match === null) {
      this.logger.warn('No field marked as active')
      throw new BadRequestException('No field marked as active')
    }

    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }

    const state = this.active.state

    if (state !== FieldState.AUTO && state !== FieldState.DRIVER) {
      this.logger.warn(`Field ${this.active.field.name} is not in autonomous or driver`)
      throw new BadRequestException(`Field ${this.active.field.name} is not in autonomous or driver`)
    }

    this.active.endTime = null

    if (state === FieldState.AUTO) {
      this.logger.log(`Autonomous complete on field ${this.active.field.name}`)
      this.active.state = FieldState.PAUSED
    } else {
      this.logger.log(`Driver control complete on field ${this.active.field.name}`)
      this.active.state = FieldState.SCORING
      await this.manager.markPlayed(this.active.match.id)
      await this.status.refresh(this.active.field.id)

      setTimeout(() => {
        void this.clearActive()
      }, 3000)
    }

    await this.setActive(this.active)
  }

  async resetMatch (): Promise<void> {
    if (this.active === null || this.active.match === null) {
      this.logger.warn('No field marked as active')
      throw new BadRequestException('No field marked as active')
    }

    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }

    this.logger.log(`Resetting match on field ${this.active.field.name}`)

    this.active.endTime = null
    this.active.state = FieldState.IDLE

    await this.setActive(this.active)
  }

  async onFieldStatusesChange (statuses: FieldStatus[]): Promise<void> {
    this.logger.log('Updating field statuses')
    for (const status of statuses) {
      if (this.active !== null && status.field.id === this.active.field.id && status.match?.id !== this.active.match?.id) {
        await this.setActive(status)
      } else if (this.onDeck !== null && status.field.id === this.onDeck.field.id) {
        await this.setOnDeck(status)
      }
    }
  }
}
