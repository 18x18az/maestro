import { Module } from '@nestjs/common'
import { PublishModule } from '../publish'
import { StatusPublisher } from './status.publisher'
import { NetworkMonitor } from './network.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [PublishModule, HttpModule],
  providers: [StatusPublisher, NetworkMonitor],
  exports: [PublishModule, StatusPublisher]
})
export class StatusModule {}
