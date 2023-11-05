import { Module } from '@nestjs/common'
import { PublishModule } from '../publish'
import { StatusPublisher } from './status.publisher'

@Module({
  imports: [PublishModule],
  providers: [StatusPublisher],
  exports: [PublishModule, StatusPublisher]
})
export class StatusModule {}
