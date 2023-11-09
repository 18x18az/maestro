import { Body, Controller, Param, Post } from '@nestjs/common'
import { FieldControlInternal } from './field-control.internal'
import { TimeoutService } from './timeout.service'
import { AutomationState } from './field-control.interface'

@Controller('fieldControl')
export class FieldControlController {
  constructor (
    private readonly service: FieldControlInternal,
    private readonly timeout: TimeoutService
  ) {}

  @Post('queue/field/:fieldId')
  async queueField (@Param('fieldId') fieldId: number, @Body() body: { match: number }): Promise<void> {
    await this.service.onManualAction()
    await this.service.queueField(fieldId, body.match)
  }

  @Post('remove')
  async removeFromQueue (@Body() body: { match: number }): Promise<void> {
    await this.service.onManualAction()
    await this.service.removeFromQueue(body.match)
  }

  @Post('move')
  async moveMatch (@Body() body: { match: number, targetField: number }): Promise<void> {
    await this.service.onManualAction()
    await this.service.moveMatch(body.match, body.targetField)
  }

  @Post('markNext')
  async markNext (@Body() body: { field: number }): Promise<void> {
    await this.service.markNext(body.field)
  }

  @Post('pushActive')
  async pushActive (): Promise<void> {
    await this.service.pushActive()
  }

  @Post('clearActive')
  async clearActive (): Promise<void> {
    await this.service.clearActive()
  }

  @Post('automation')
  async setAutomation (@Body() body: { state: boolean }): Promise<void> {
    const state = body.state ? AutomationState.ENABLED : AutomationState.CAN_ENABLE
    await this.service.setAutomation(state)
  }

  @Post('replay')
  async replay (@Body() body: { match: number }): Promise<void> {
    await this.service.replay(body.match)
  }

  @Post('start')
  async start (): Promise<void> {
    await this.service.start()
  }

  @Post('endEarly')
  async endEarly (): Promise<void> {
    await this.service.endMatchSection()
  }

  @Post('reset')
  async reset (): Promise<void> {
    await this.service.resetMatch()
  }
}
