import { Controller, Post } from '@nestjs/common'
import { FieldDisplayService } from './field-display.service'

@Controller('stream')
export class StreamController {
  constructor (
    private readonly service: FieldDisplayService
  ) {}

  @Post('cut')
  async cut (): Promise<void> {
    await this.service.cut()
  }
}
