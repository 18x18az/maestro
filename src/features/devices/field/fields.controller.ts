import { Body, Controller, Param, Post } from '@nestjs/common'
import { FieldService } from './fields.service'

@Controller('fields')
export class FieldsController {
  constructor (private readonly service: FieldService) {}

  @Post(':fieldId/name')
  async setName (@Param('fieldId') fieldId: number, @Body() body: { name: string }): Promise<void> {
    await this.service.renameField(fieldId, body.name)
  }
}
