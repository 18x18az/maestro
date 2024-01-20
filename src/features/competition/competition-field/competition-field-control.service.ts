import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { MATCH_STAGE } from './competition-field.interface'
import { LoadFieldEvent } from '../../field-control/load-field.event'
import { CONTROL_MODE } from '../../field-control/field-control.interface'
import { QueueSittingEvent } from './queue-sitting.event'
import { RemoveOnTableSittingEvent } from './remove-on-table-sitting.event'
import { CompetitionFieldRepo } from './competition-field.repo'
import { StartFieldEvent } from '../../field-control/start-field.event'

@Injectable()
export class CompetitionFieldControlService {
  private readonly logger: Logger = new Logger(CompetitionFieldControlService.name)

  private readonly cache: Map<number, MATCH_STAGE> = new Map()

  constructor (
    private readonly loadField: LoadFieldEvent,
    private readonly queueEvent: QueueSittingEvent,
    private readonly removeEvent: RemoveOnTableSittingEvent,
    private readonly repo: CompetitionFieldRepo,
    private readonly startEvent: StartFieldEvent
  ) {}

  async onModuleInit (): Promise<void> {
    this.queueEvent.registerAfter(async (data) => {
      await this.putOnField(data.fieldId)
    })

    this.removeEvent.registerBefore(async (data) => {
      this.remove(data.fieldId)
    })

    this.startEvent.registerBefore(async (data) => {
      const current = this.get(data.fieldId)

      if (current === MATCH_STAGE.EMPTY) return

      await this.startAuto(data.fieldId)
    })
  }

  async onApplicationBootstrap (): Promise<void> {
    const fields = await this.repo.getAllFields()

    for (const field of fields) {
      if (field.onFieldSittingId !== null) {
        await this.putOnField(field.fieldId)
      }
    }
  }

  get (fieldId: number): MATCH_STAGE {
    const cached = this.cache.get(fieldId)
    if (cached === undefined) {
      return MATCH_STAGE.EMPTY
    }
    return cached
  }

  remove (fieldId: number): void {
    // Cannot remove a field that is not in the cache
    const cached = this.cache.get(fieldId)
    if (cached === undefined) {
      throw new BadRequestException(`field ${fieldId} not in cache`)
    }

    // Cannot remove a field that is in the middle of a match
    if (cached === MATCH_STAGE.AUTON || cached === MATCH_STAGE.DRIVER) {
      throw new BadRequestException(`field ${fieldId} is in a match`)
    }

    // Remove the field from the cache
    this.cache.delete(fieldId)
  }

  async putOnField (fieldId: number): Promise<void> {
    const current = this.get(fieldId)

    if (current !== MATCH_STAGE.EMPTY) {
      throw new BadRequestException(`cannot put field ${fieldId} on field`)
    }

    this.cache.set(fieldId, MATCH_STAGE.QUEUED)
    await this.loadField.execute({ fieldId, mode: CONTROL_MODE.AUTO, duration: 15 * 1000 })
  }

  async startAuto (fieldId: number): Promise<void> {
    const current = this.get(fieldId)

    if (current !== MATCH_STAGE.QUEUED) {
      throw new BadRequestException(`cannot start field ${fieldId} from stage ${current}`)
    }

    this.cache.set(fieldId, MATCH_STAGE.AUTON)
  }
}
