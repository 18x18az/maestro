import { Body, Controller, Param, Post } from '@nestjs/common'
import { FieldControlInternal } from './field-control.internal'
import { TimeoutService } from './timeout.service'

@Controller('fieldControl')
export class FieldControlController {
  constructor (
    private readonly service: FieldControlInternal,
    private readonly timeout: TimeoutService
  ) {}

  @Post('queue/field/:fieldId')
  async queueField (@Param('fieldId') fieldId: number, @Body() body: { match: number }): Promise<void> {
    await this.service.queueField(fieldId, body.match)
  }

  @Post('remove')
  async removeFromQueue (@Body() body: { match: number }): Promise<void> {
    await this.service.removeFromQueue(body.match)
  }

  @Post('move')
  async moveMatch (@Body() body: { match: number, targetField: number }): Promise<void> {
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
}
