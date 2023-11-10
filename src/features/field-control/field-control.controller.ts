import { Body, Controller, Param, Post } from '@nestjs/common'
import { FieldControlInternal } from './field-control.internal'
import { AutomationState, FieldStatus } from './field-control.interface'
import { MatchManager } from './match-manager.service'
import { ActiveService } from './active-control.service'
import { EventPattern } from '@nestjs/microservices'
import { TimeoutService } from './timeout.service'

@Controller('fieldControl')
export class FieldControlController {
  constructor (
    private readonly service: FieldControlInternal,
    private readonly manager: MatchManager,
    private readonly active: ActiveService,
    private readonly timeout: TimeoutService
  ) {}

  @Post('queue/field/:field')
  async queueField (@Body() body: { match: number }, @Param('field') field: number): Promise<void> {
    await this.service.onManualAction()
    await this.manager.add(field, body.match)
  }

  @Post('remove')
  async removeFromQueue (@Body() body: { match: number }): Promise<void> {
    await this.service.onManualAction()
    await this.manager.remove(body.match)
  }

  @Post('move')
  async moveMatch (@Body() body: { match: number, targetField: number }): Promise<void> {
    await this.service.onManualAction()
    await this.manager.move(body.match, body.targetField)
  }

  @Post('markNext')
  async markNext (@Body() body: { field: number }): Promise<void> {
    await this.active.markNext(body.field)
  }

  @Post('pushActive')
  async pushActive (): Promise<void> {
    await this.active.pushActive()
  }

  @Post('clearActive')
  async clearActive (): Promise<void> {
    await this.active.clearActive()
  }

  @Post('automation')
  async setAutomation (@Body() body: { state: boolean }): Promise<void> {
    const state = body.state ? AutomationState.ENABLED : AutomationState.CAN_ENABLE
    await this.service.setAutomation(state)
  }

  @Post('replay')
  async replay (@Body() body: { match: number }): Promise<void> {
    await this.manager.replay(body.match)
  }

  @Post('start')
  async start (): Promise<void> {
    await this.active.start()
  }

  @Post('endEarly')
  async endEarly (): Promise<void> {
    await this.active.endMatchSection()
  }

  @Post('reset')
  async reset (): Promise<void> {
    await this.active.resetMatch()
  }

  @EventPattern('unqueued')
  async onUnqueued (): Promise<void> {
    await this.service.onUnqueuedChange()
  }

  @EventPattern('fieldStatuses')
  async onFieldStatusesChange (statuses: FieldStatus[]): Promise<void> {
    await this.active.onFieldStatusesChange(statuses)
  }

  @Post('timeout')
  async setTimeout (): Promise<void> {
    await this.timeout.callTimeout()
  }
}
