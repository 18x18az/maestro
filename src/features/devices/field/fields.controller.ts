import { Controller } from '@nestjs/common'
import { FieldService } from './fields.service'

@Controller('fields')
export class FieldsController {
  constructor (private readonly service: FieldService) {}
}
