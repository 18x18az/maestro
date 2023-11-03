// import { Controller, Post } from '@nestjs/common'
// import { EventPattern } from '@nestjs/microservices'
// import { QueueingService } from './queueing.service'
// import { QUAL_BLOCK_LIST_CHANNEL, QualMatchBlockBroadcast } from '@/old/initial'
// import { FieldInfoBroadcast } from '@/old/devices/field'

// @Controller('queueing')
// export class QueueingController {
//   constructor (private readonly service: QueueingService) {}

//   @EventPattern(QUAL_BLOCK_LIST_CHANNEL)
//   async handleQualBlocks (blocks: QualMatchBlockBroadcast[]): Promise<void> {
//     await this.service.handleQualBlockUpdate(blocks)
//   }

//   @EventPattern('fields')
//   async handleFieldInfo (fields: FieldInfoBroadcast[]): Promise<void> {
//     await this.service.handleFieldInfo(fields)
//   }

//   @Post('nextBlock')
//   async nextBlock (): Promise<void> {
//     await this.service.startNextBlock()
//   }
// }
