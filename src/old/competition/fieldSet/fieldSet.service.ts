// import { Injectable, Logger } from '@nestjs/common'
// import { FieldSetPublisher } from './fieldSet.publisher'
// import { QueuedMatch } from '../queueing'

// @Injectable()
// export class FieldSetService {
//   private readonly logger = new Logger(FieldSetService.name)

//   currentMatch: QueuedMatch | null = null

//   constructor (private readonly publisher: FieldSetPublisher) {}

//   async handleQueuedMatchesUpdate (matches: QueuedMatch[]): Promise<void> {
//     if (this.currentMatch !== null) return

//     // get first match that's MatchResolution.ON_DECK
//     const onDeckMatch = matches.find(match => match.resolution === 'ON_DECK')

//     if (onDeckMatch === undefined) return

//     this.currentMatch = onDeckMatch
//     this.logger.log(`Current match is ${this.currentMatch.number} on ${this.currentMatch.fieldName}`)
//     await this.publisher.publishCurrentMatch(this.currentMatch)
//   }
// }
