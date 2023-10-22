import { Injectable } from '@nestjs/common'
import { FieldInfo } from './fields.interface'
import { FieldService } from './fields.service'

@Injectable()
export class PublicFieldService {
  constructor (private readonly fieldService: FieldService) {}

  async initialFields (fields: FieldInfo[]): Promise<void> {
    await this.fieldService.createFields(fields)
  }
}
