import { Controller, Post } from '@nestjs/common'
import { MockService } from './mock.service'

@Controller('mock')
export class MockController {
  constructor (private readonly mockService: MockService) {}
  @Post('generate')
  async generateMockData (): Promise<void> {
    await this.mockService.generate()
  }
}
