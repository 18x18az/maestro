import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { PublishService } from '../../../utils/publish/publish.service'
import { QualScheduleBlockUpload, QualScheduleUpload } from './qual-schedule.interface'
import { QualScheduleRepo } from './qual-schedule.repo'

@Injectable()
export class QualScheduleService {
  generateQualSchedule (): void {
    if (!this.canConclude) {
      this.logger.warn('Attempted to generate qual schedule at incorrect time')
      throw new HttpException('Not in state to generate qual schedule', HttpStatus.BAD_REQUEST)
    }

    this.logger.log('Generating qual schedule')
  }

  private readonly logger = new Logger(QualScheduleService.name)
  canConclude: boolean = false

  constructor (private readonly repo: QualScheduleRepo, private readonly publisher: PublishService) { }

  updateCanConclude (canConclude: boolean): void {
    this.canConclude = canConclude
  }

  private async storeMatchBlock (block: QualScheduleBlockUpload): Promise<void> {
    const blockId = await this.repo.createBlock(block)

    await Promise.all(block.matches.map(async match => {
      const redAllianceId = this.repo.createAlliance(match.redAlliance)
      const blueAllianceId = this.repo.createAlliance(match.blueAlliance)
      const matchId = await this.repo.createMatch(await redAllianceId, await blueAllianceId, match)
      await this.repo.appendMatchToBlock(blockId, matchId)
    }))
  }

  async uploadQualSchedule (schedule: QualScheduleUpload): Promise<void> {
    this.logger.log('Received qual schedule')

    await Promise.all(schedule.blocks.map(async block => {
      await this.storeMatchBlock(block)
    }))
  }
}
