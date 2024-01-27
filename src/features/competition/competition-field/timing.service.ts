import { Injectable } from '@nestjs/common'

@Injectable()
export class TimingService {
  async getAutonLength (): Promise<number> {
    return 15 * 1000
  }

  async getDriverLength (): Promise<number> {
    return 105 * 1000
  }
}
