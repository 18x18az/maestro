import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class SettingsService {
  constructor (private readonly config: ConfigService) { }

  isTestMode (): boolean {
    return this.config.get('TEST_MODE') === 'true'
  }
}
