import { Module } from '@nestjs/common'
import { MockController } from './mock.controller'
import { MockService } from './mock.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [HttpModule],
  controllers: [MockController],
  providers: [MockService]
})
export class MockModule {}
