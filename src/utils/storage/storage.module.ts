import { Module } from '@nestjs/common'
import { StorageService } from './storage.service'
import { PrismaModule } from '../prisma'

@Module({
  imports: [PrismaModule],
  providers: [StorageService],
  exports: [StorageService, PrismaModule]
})
export class StorageModule { }
