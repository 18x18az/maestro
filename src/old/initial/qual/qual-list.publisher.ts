// import { Injectable } from '@nestjs/common'
// import { PublishService } from '@/old_utils/publish/publish.service'
// import { Payload, Publisher } from '@alecmmiller/nestjs-client-generator'
// import { QUAL_MATCH_LIST_CHANNEL, QUAL_BLOCK_LIST_CHANNEL, QualMatch, QualMatchBlockBroadcast } from '.'

// @Injectable()
// export class QualSchedulePublisher {
//   constructor (private readonly publisher: PublishService) {}

//   @Publisher(QUAL_MATCH_LIST_CHANNEL)
//   async publishQuals (@Payload({ isArray: true, type: QualMatch }) matches: QualMatch[]): Promise<void> {
//     await this.publisher.broadcast(QUAL_MATCH_LIST_CHANNEL, matches)
//   }

//   @Publisher(QUAL_BLOCK_LIST_CHANNEL)
//   async publishBlocks (@Payload({ isArray: true, type: QualMatchBlockBroadcast }) blocks: QualMatchBlockBroadcast[]): Promise<void> {
//     await this.publisher.broadcast(QUAL_BLOCK_LIST_CHANNEL, blocks)
//   }
// }
