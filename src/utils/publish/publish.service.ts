import { Inject, Injectable } from '@nestjs/common'
import { PigeonService } from 'pigeon-mqtt-nest'
import { makeString } from '../string2json'

@Injectable()
export class PublishService {
  constructor (@Inject(PigeonService) private readonly pigeonService: PigeonService) {}

  async broadcast (topic: string, payload: any): Promise<void> {
    const encoded = makeString(payload)
    await this.pigeonService.publish({ topic, payload: encoded, cmd: 'publish', retain: true, qos: 2 })
  }
}
