import { Injectable, Logger } from '@nestjs/common'
import { CompetitionControlCache } from './competition.cache'
import { FieldEntity } from '../../field/field.entity'
import { FieldService } from '../../field/field.service'

@Injectable()
export class CompetitionControlService {
  private readonly logger = new Logger(CompetitionControlService.name)

  constructor (
    private readonly cache: CompetitionControlCache,
    private readonly fieldService: FieldService
  ) {}

  async getLiveField (): Promise<FieldEntity | null> {
    const id = this.cache.getLiveField()

    if (id === null) return null

    return await this.fieldService.getField(id)
  }

  async getOnDeckField (): Promise<FieldEntity | null> {
    const id = this.cache.getOnDeckField()

    if (id === null) return null

    return await this.fieldService.getField(id)
  }
}
