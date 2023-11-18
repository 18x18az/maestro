import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { FieldStatusService } from './field-status.service'
import { FieldState, FieldStatus } from './field-control.interface'
import { FieldControlPublisher } from './field-control.publisher'

type SkillsType = FieldState.PROG_SKILLS | FieldState.DRIVER_SKILLS

interface OngoingSkills {
  type: SkillsType
  end: NodeJS.Timeout
  status: FieldStatus
}

@Injectable()
export class SkillsService {
  private readonly logger: Logger = new Logger(SkillsService.name)

  private readonly ongoing: Map<number, OngoingSkills> = new Map()

  constructor (
    private readonly status: FieldStatusService,
    private readonly publisher: FieldControlPublisher
  ) {}

  async start (fieldId: number, type: FieldState.PROG_SKILLS | FieldState.DRIVER_SKILLS): Promise<void> {
    const current = await this.status.get(fieldId)
    this.logger.log(`Starting ${type} on field ${current.field.name}`)
    current.state = type
    const end = new Date()
    end.setSeconds(end.getSeconds() + 60)
    current.endTime = end.toISOString()
    await this.publisher.publishFieldStatus(current)
    const timeToWait = end.getTime() - Date.now()
    const timeout = setTimeout(() => {
      void this.end(fieldId)
    }, timeToWait)
    this.ongoing.set(fieldId, {
      type,
      end: timeout,
      status: current
    })
  }

  async end (fieldId: number): Promise<void> {
    const ongoing = this.ongoing.get(fieldId)
    if (ongoing === undefined) {
      throw new BadRequestException(`Skills on field ${fieldId} not found`)
    }
    this.logger.log(`Ending ${ongoing.type} on field ${ongoing.status.field.name}`)
    clearTimeout(ongoing.end)
    const status = ongoing.status
    status.state = FieldState.IDLE
    status.endTime = null
    await this.publisher.publishFieldStatus(status)
  }
}
