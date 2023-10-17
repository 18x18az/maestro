import { Injectable } from '@nestjs/common'
import { PublishService } from 'src/utils/publish/publish.service'
import { QualMatch } from './qual-schedule.interface'
import { Payload, Publisher } from '@alecmmiller/nestjs-client-generator'

export const QUAL_MATCH_CHANNEL = 'qualification/matches'

@Injectable()
export class QualSchedulePublisher {
  constructor (private readonly publisher: PublishService) {}

  @Publisher(QUAL_MATCH_CHANNEL)
  async publishQualMatches (@Payload({ isArray: true, type: QualMatch }) matches: QualMatch[]): Promise<void> {
    await this.publisher.broadcast(QUAL_MATCH_CHANNEL, matches)
  }
}
