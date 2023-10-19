import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { QualScheduleBlockUpload, QualUpload } from './qual-list.interface'
import { QualScheduleRepo } from './qual-list.repo'
import { QualSchedulePublisher } from './qual-list.publisher'

@Injectable()
export class QualScheduleService {
  constructor (private readonly repo: QualScheduleRepo, private readonly publisher: QualSchedulePublisher) { }

  async onApplicationBootstrap (): Promise<void> {
    await this.broadcastQualSchedule()
  }

  generateQualSchedule (): void {
    if (!this.canConclude) {
      this.logger.warn('Attempted to generate qual schedule at incorrect time')
      throw new HttpException('Not in state to generate qual schedule', HttpStatus.BAD_REQUEST)
    }

    this.logger.log('Generating qual schedule')
  }

  private readonly logger = new Logger(QualScheduleService.name)
  canConclude: boolean = false

  updateCanConclude (canConclude: boolean): void {
    this.canConclude = canConclude
  }

  private async storeMatchBlock (block: QualScheduleBlockUpload): Promise<void> {
    await this.repo.clearSchedule()

    const blockId = await this.repo.createBlock(block)

    await Promise.all(block.matches.map(async match => {
      const redAllianceId = this.repo.createAlliance(match.redAlliance)
      const blueAllianceId = this.repo.createAlliance(match.blueAlliance)
      const matchId = await this.repo.createMatch(await redAllianceId, await blueAllianceId, match)
      await this.repo.appendMatchToBlock(blockId, matchId)
    }))
  }

  async uploadQualSchedule (schedule: QualUpload): Promise<void> {
    this.logger.log('Received qual schedule')

    await Promise.all(schedule.blocks.map(async block => {
      await this.storeMatchBlock(block)
    }))

    await this.broadcastQualSchedule()
  }

  async broadcastQualSchedule (): Promise<void> {
    const matches = await this.repo.getMatches()

    if (matches.length === 0) {
      return
    }

    this.logger.log('Broadcasting qual schedule')
    await this.publisher.publishQuals(matches)
  }
}
