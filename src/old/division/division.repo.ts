// import { Injectable } from '@nestjs/common'
// import { Division, DivisionCreate } from './division.interface'
// import { PrismaService } from '../../old_utils/prisma/prisma.service'

// @Injectable()
// export class DivisionRepo {
//   constructor (private readonly prisma: PrismaService) {}

//   async createDivisions (divisions: DivisionCreate[]): Promise<void> {
//     await Promise.all(divisions.map(async (division) => {
//       await this.prisma.division.create({ data: division })
//     }))
//   }

//   async getDivisions (): Promise<Division[]> {
//     return await this.prisma.division.findMany()
//   }
// }
