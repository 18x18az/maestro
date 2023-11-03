import { PublishService } from '@/old_utils/publish/publish.service'
import { Injectable } from '@nestjs/common'
import { ContextfulMatchResult, DisplayState, Field, FieldStatus, MatchBlock, STAGE, Team } from './simple.interface'

@Injectable()
export class SimplePublisher {
  constructor (private readonly publisher: PublishService) {}

  async publishStage (stage: STAGE): Promise<void> {
    await this.publisher.broadcast('stage', stage)
  }

  async publishQuals (blocks: MatchBlock[]): Promise<void> {
    await this.publisher.broadcast('quals', blocks)
  }

  async publishTeams (teams: Team[]): Promise<void> {
    await this.publisher.broadcast('teams', teams)
  }

  async publishFields (fields: Field[]): Promise<void> {
    await this.publisher.broadcast('fields', fields)
  }

  async publishFieldStatus (fieldStatus: FieldStatus): Promise<void> {
    await this.publisher.broadcast(`fieldStatus/${fieldStatus.id}`, fieldStatus)
  }

  async publishFieldStatuses (fieldStatuses: FieldStatus[]): Promise<void> {
    await this.publisher.broadcast('fieldStatuses', fieldStatuses)
  }

  async publishFieldControl (fieldStatus: FieldStatus): Promise<void> {
    await this.publisher.broadcast('fieldControl', fieldStatus)
  }

  async publishMatchResult (result: ContextfulMatchResult | null): Promise<void> {
    await this.publisher.broadcast('matchResult', result)
  }

  async publishDisplayState (state: DisplayState): Promise<void> {
    await this.publisher.broadcast('displayState', state)
  }

  async publishTimeout (timeout: Date | null): Promise<void> {
    await this.publisher.broadcast('timeout', timeout)
  }
}
