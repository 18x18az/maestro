import { Module } from '@nestjs/common'
import { StorageService } from './storage.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EphemeralEntity } from './ephemeral.entity'
import { PersistentEntity } from './persistent.entity'

@Module({
  imports: [TypeOrmModule.forFeature([EphemeralEntity, PersistentEntity])],
  providers: [StorageService],
  exports: [StorageService]
})
export class StorageModule { }
