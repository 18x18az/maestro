import { Injectable } from '@nestjs/common'
import { PublishService } from 'utils/publish/publish.service'
import { QualMatch } from './qual-list.interface'
import { Payload, Publisher } from '@alecmmiller/nestjs-client-generator'
import { QUAL_MATCH_LIST_CHANNEL } from '.'

@Injectable()
export class QualSchedulePublisher {
  constructor (private readonly publisher: PublishService) {}

  @Publisher(QUAL_MATCH_LIST_CHANNEL)
  async publishQuals (@Payload({ isArray: true, type: QualMatch }) matches: QualMatch[]): Promise<void> {
    await this.publisher.broadcast(QUAL_MATCH_LIST_CHANNEL, matches)
  }
}
