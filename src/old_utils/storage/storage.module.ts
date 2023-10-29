import { Module } from '@nestjs/common'
import { StorageService } from './storage.service'
import { PrismaService } from '../prisma/prisma.service'

@Module({
  providers: [PrismaService, StorageService],
  exports: [PrismaService, StorageService]
})
export class StorageModule { }
