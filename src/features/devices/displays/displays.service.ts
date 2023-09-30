import { Injectable, Logger } from '@nestjs/common'
import { DispplaysPublisher } from './displays.publisher'

@Injectable()
export class DisplaysService {
  private readonly logger = new Logger(DisplaysService.name)

  constructor (private readonly publisher: DispplaysPublisher) {}

  async registerDisplay (uuid: string): Promise<void> {
    this.logger.log(`Received registration request from display with UUID ${uuid}`)
    await this.publisher.publishDisplay(uuid, 1)
  }
}
