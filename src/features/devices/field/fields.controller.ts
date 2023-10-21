import { Controller, Param, Post } from '@nestjs/common'
import { FieldService } from './fields.service'

interface FieldParams {
  fieldId: string
}

@Controller('fields')
export class FieldsController {
  constructor (private readonly service: FieldService) {}

  @Post(':fieldId/runTestMatch')
  async runTestMatch (@Param() params: FieldParams): Promise<void> {
    void this.service.runTestMatch(params.fieldId)
  }
}
