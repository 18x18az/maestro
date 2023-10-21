import { Injectable } from '@nestjs/common'
import { FieldInfo } from './fields.interface'
import { FieldService } from './fields.service'

@Injectable()
export class PublicFieldService {
  constructor (private readonly fieldService: FieldService) {}

  async initialFields (fields: FieldInfo[]): Promise<void> {
    const createPromises = fields.map(async (field) => await this.fieldService.createField(field))
    await Promise.all(createPromises)
  }
}
