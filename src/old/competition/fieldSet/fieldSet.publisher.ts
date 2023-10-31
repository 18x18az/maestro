// import { Payload, Publisher } from '@alecmmiller/nestjs-client-generator'
// import { Injectable } from '@nestjs/common'
// import { PublishService } from '@/old_utils/publish/publish.service'
// import { QueuedMatch } from '../queueing'

// @Injectable()
// export class FieldSetPublisher {
//   constructor (private readonly publisher: PublishService) {}

//   @Publisher('currentMatch')
//   async publishCurrentMatch (@Payload({}) match: QueuedMatch): Promise<void> {
//     await this.publisher.broadcast('currentMatch', match)
//   }
// }
