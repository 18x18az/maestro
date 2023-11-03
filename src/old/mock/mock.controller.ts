import { Controller, MethodNotAllowedException, Post } from '@nestjs/common'
import { MockService } from './mock.service'
import { ConfigService } from '@nestjs/config'

@Controller('mock')
export class MockController {
  constructor (private readonly mockService: MockService, private readonly config: ConfigService) {}
  @Post('generate')
  async generateMockData (): Promise<void> {
    if (this.config.get('TEST_MODE') !== 'true') {
      throw new MethodNotAllowedException()
    }
    await this.mockService.generate()
  }
}
