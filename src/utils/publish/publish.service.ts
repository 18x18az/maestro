import { Injectable } from '@nestjs/common'
import { PigeonService } from '@alecmmiller/pigeon-mqtt-nest'

@Injectable()
export class PublishService {
  constructor (private readonly pigeonService: PigeonService) {}

  async broadcast (topic: string, payload: object | null): Promise<void> {
    const encoded = JSON.stringify(payload)
    await this.pigeonService.publish({ topic, payload: encoded, cmd: 'publish', retain: true, qos: 2 })
  }
}
