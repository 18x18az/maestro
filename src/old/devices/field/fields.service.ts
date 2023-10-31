// import { Injectable, Logger } from '@nestjs/common'
// import { FieldsPublisher } from './fields.publisher'
// import { FieldInfo } from './fields.interface'
// import { FieldRepo } from './field.repo'

// @Injectable()
// export class FieldService {
//   private readonly logger = new Logger(FieldService.name)
//   constructor (private readonly publisher: FieldsPublisher, private readonly repo: FieldRepo
//   ) {}

//   async onApplicationBootstrap (): Promise<void> {
//     await this.broadcastFields()
//     const fields = await this.repo.getFields()
//     const promises = fields.map(async field => await this.broadcastField(field.fieldId))
//     await Promise.all(promises)
//   }

//   async broadcastFields (): Promise<void> {
//     const fields = await this.repo.getFields()
//     await this.publisher.publishFields(fields)
//   }

//   async broadcastField (fieldId: number): Promise<void> {
//     const field = await this.repo.getField(fieldId)
//     await this.publisher.publishField(fieldId.toString(), field)
//   }

//   async createFields (fields: FieldInfo[]): Promise<void> {
//     await this.repo.clearFields()
//     for (const field of fields) {
//       const id = await this.repo.createField(field)
//       await this.broadcastField(id)
//     }
//     await this.broadcastFields()
//   }

//   async renameField (fieldId: number, name: string): Promise<void> {
//     this.logger.log(`Renaming field ${fieldId} to ${name}`)
//     await this.repo.renameField(fieldId, name)
//     await this.broadcastFields()
//     await this.broadcastField(fieldId)
//   }
// }
