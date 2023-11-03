// import { PrismaService } from '@/old_utils/prisma/prisma.service'
// import { Injectable, NotFoundException } from '@nestjs/common'
// import { FieldInfo, FieldInfoBroadcast, FieldState } from './fields.interface'

// @Injectable()
// export class FieldRepo {
//   private readonly working: Map<string, FieldInfoBroadcast> = new Map()
//   constructor (private readonly db: PrismaService) {}

//   async clearFields (): Promise<void> {
//     await this.db.field.deleteMany({})
//     this.working.clear()
//   }

//   async renameField (fieldId: number, name: string): Promise<void> {
//     const working = this.working.get(fieldId.toString())

//     if (working === undefined) {
//       throw new NotFoundException(`Field ${fieldId} not found`)
//     }

//     working.name = name
//     await this.db.field.update({
//       where: {
//         id: fieldId
//       },
//       data: {
//         name
//       }
//     })
//   }

//   async createField (field: FieldInfo): Promise<number> {
//     const created = await this.db.field.create({
//       data: {
//         name: field.name,
//         isCompetition: Number(field.isCompetition)
//       }
//     })
//     this.working.set(created.id.toString(), {
//       name: created.name,
//       isCompetition: Boolean(created.isCompetition),
//       fieldId: created.id,
//       state: FieldState.IDLE
//     })

//     return created.id
//   }

//   async getFields (): Promise<FieldInfoBroadcast[]> {
//     if (this.working.size === 0) {
//       const fields = await this.db.field.findMany()
//       fields.forEach(field => {
//         this.working.set(field.id.toString(), {
//           name: field.name,
//           isCompetition: Boolean(field.isCompetition),
//           fieldId: field.id,
//           state: FieldState.IDLE
//         })
//       })
//     }

//     return Array.from(this.working.values())
//   }

//   async getField (fieldId: number): Promise<FieldInfoBroadcast> {
//     const field = this.working.get(fieldId.toString())
//     if (field === undefined) {
//       throw new NotFoundException(`Field ${fieldId} not found`)
//     }
//     return field
//   }
// }
