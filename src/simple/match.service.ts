// import { BadRequestException, Injectable, Logger } from '@nestjs/common'
// import { SimpleRepo } from './simple.repo'
// import { FieldControlService } from './field-control.service'
// import { FieldState } from './simple.interface'

// @Injectable()
// export class MatchService {
//   private readonly logger = new Logger(MatchService.name)

//   constructor (
//     private readonly repo: SimpleRepo,
//     private readonly fieldControl: FieldControlService
//   ) {}

//   async handleEmptyField (fieldId: number): Promise<void> {
//     this.logger.log(`Field ${fieldId} is empty`)
//     await this.fieldControl.markEmpty(fieldId)
//   }

//   async queueField (fieldId: number): Promise<void> {
//     const block = await this.repo.getInProgressBlock()

//     if (block === null) {
//       throw new BadRequestException('No block in progress')
//     }

//     const match = await this.repo.getNextMatch(fieldId, block)

//     if (match === null) {
//       await this.handleEmptyField(fieldId)
//       return
//     }

//     await this.fieldControl.putMatchOnField(fieldId, match, FieldState.ON_DECK)
//   }
// }
