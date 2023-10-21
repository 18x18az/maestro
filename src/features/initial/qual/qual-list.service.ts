import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { QualScheduleBlockUpload, QualUpload } from './qual-list.interface'
import { QualSchedulePublisher } from './qual-list.publisher'
import { QualListRepo } from './qual-list.repo'

@Injectable()
export class QualScheduleService {
  constructor (private readonly repo: QualListRepo, private readonly publisher: QualSchedulePublisher) { }

  async onApplicationBootstrap (): Promise<void> {
    await this.repo.hydrateQuals()
    // await this.broadcastQuals()
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
    // await this.repo.clearSchedule()

    // const blockId = await this.repo.createBlock(block)

    // const previousPromise = Promise.resolve()

    // block.matches.forEach(async match => {
    //   console.log(match)
    //   // const redAllianceId = this.repo.createAlliance(match.redAlliance)
    //   // const blueAllianceId = this.repo.createAlliance(match.blueAlliance)
    //   await previousPromise
    //   // const matchId = await this.repo.createMatch(await redAllianceId, await blueAllianceId, match)
    //   // previousPromise = this.repo.appendMatchToBlock(blockId, matchId)
    // })

    // await previousPromise
  }

  async uploadQualSchedule (schedule: QualUpload): Promise<void> {
    this.logger.log('Received qual schedule')

    // let previousPromise = Promise.resolve()

    // schedule.blocks.forEach(async block => {
    //   await previousPromise
    //   previousPromise = this.storeMatchBlock(block)
    // })

    // await previousPromise

    await this.broadcastQuals()
  }

  async broadcastQuals (): Promise<void> {
    // const matches = await this.repo.getMatches()

    // const blockIds = await this.repo.getMatchBlockIds()

    // if (matches.length === 0) {
    //  return
    // }

    this.logger.log('Broadcasting qual schedule')
    // await this.publisher.publishQuals(matches)
  }
}
