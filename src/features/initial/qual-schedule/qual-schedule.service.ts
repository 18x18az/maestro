import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { PublishService } from 'src/utils/publish/publish.service'
import { StorageService } from 'src/utils/storage/storage.service'

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

  constructor (private readonly storage: StorageService, private readonly publisher: PublishService) { }

  updateCanConclude (canConclude: boolean): void {
    this.canConclude = canConclude
  }
}
