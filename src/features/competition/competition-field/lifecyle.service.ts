import { Injectable, Logger } from '@nestjs/common'
import { CompetitionFieldPublisher } from './competition-field.publisher'
import { CompetitionFieldStatus } from './competition-field.interface'
import { CompetitionFieldRepo } from './competition-field.repo'
import { Match, MatchService } from '../match'
import { CompetitionFieldControlService } from './competition-field-control.service'
import { FieldService } from '../../field'

@Injectable()
export class LifecycleService {
  private readonly logger = new Logger(LifecycleService.name)

  constructor (private readonly publisher: CompetitionFieldPublisher,
    private readonly fields: FieldService,
    private readonly repo: CompetitionFieldRepo,
    private readonly matches: MatchService,
    private readonly control: CompetitionFieldControlService
  ) {}

  async onApplicationBootstrap (): Promise<void> { // TODO this would be better handled by subscribing to the field list and publishing on changes
    for (const field of await this.fields.getCompetitionFields()) {
      const onDeckId = await this.repo.getMatchOnDeck(field.id)
      const onFieldId = await this.repo.getMatchOnField(field.id)
      let onDeck: Match | null = null
      let onField: Match | null = null

      if (onDeckId !== null) {
        onDeck = await this.matches.getMatch(onDeckId)
      }
      if (onFieldId !== null) {
        onField = await this.matches.getMatch(onFieldId)
      }

      const initialState: CompetitionFieldStatus = {
        field: await this.fields.getField(field.id),
        onDeck,
        onField,
        stage: await this.control.get(field.id)
      }

      this.logger.log(`Field ${field.id} is ${initialState.stage}`)

      await this.publisher.publishFieldStatus(field.id, initialState)
    }
  }
}
