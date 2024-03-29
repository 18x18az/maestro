import { Injectable, Logger } from '@nestjs/common'
import { SittingStatus } from './match.interface'
import { MatchInternal } from './match.internal'
import { DriverEndEvent, DriverEndResult } from '../competition-field/driver-end.event'
import { MatchRepo } from './match.repo'
import { MatchEntity } from './match.entity'

@Injectable()
export class MatchService {
  private readonly logger = new Logger(MatchService.name)

  constructor (
    private readonly service: MatchInternal,
    private readonly driverEnd: DriverEndEvent,
    private readonly repo: MatchRepo
  ) {}

  onModuleInit (): void {
    this.driverEnd.registerOnComplete(async (data: DriverEndResult) => {
      await this.markPlayed(data.sittingId)
    })
  }

  // TODO these should be events
  async markQueued (sitting: number): Promise<void> {
    this.logger.log(`Marking sitting ID ${sitting} as queued`)
    await this.service.updateSittingStatus(sitting, SittingStatus.QUEUED)
  }

  async unmarkQueued (sitting: number): Promise<void> {
    this.logger.log(`Unmarking sitting ID ${sitting} as queued`)
    await this.service.updateSittingStatus(sitting, SittingStatus.NOT_STARTED)
  }

  async markScored (match: number): Promise<void> {
    this.logger.log(`Marking match ID ${match} as scored`)
    await this.service.updateSittingStatus(match, SittingStatus.COMPLETE)
  }

  async markPlayed (match: number): Promise<void> {
    this.logger.log(`Marking match ID ${match} as played`)
    await this.service.updateSittingStatus(match, SittingStatus.SCORING)
  }

  async getNextSitting (fieldId: number): Promise<number | null> {
    return await this.repo.getNextSitting(fieldId)
  }

  async getMatch (matchId: number): Promise<MatchEntity | null> {
    return await this.repo.getMatch(matchId)
  }
}
