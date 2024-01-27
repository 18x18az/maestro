import { Module } from '@nestjs/common'
import { TimeoutService } from './timeout.service'
import { TimeoutResolver } from './timeout.resolver'

@Module({
  providers: [TimeoutService, TimeoutResolver]
})
export class TimeoutModule {}
