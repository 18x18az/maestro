import { Injectable, Logger } from '@nestjs/common'
import OBSWebSocket from 'obs-websocket-js'

@Injectable()
export class ObsService {
  private readonly obs: OBSWebSocket = new OBSWebSocket()
  private readonly logger: Logger = new Logger(ObsService.name)

  async onModuleInit (): Promise<void> {
    await this.obs.connect('ws://localhost:4455')
    this.logger.log('Connected to OBS')
  }

  async setPreviewScene (sceneName: string): Promise<void> {
    this.logger.log(`Setting preview scene to ${sceneName}`)
    await this.obs.call('SetCurrentPreviewScene', { sceneName })
  }

  async triggerTransition (): Promise<void> {
    this.logger.log('Triggering transition')
    await this.obs.call('TriggerStudioModeTransition')
  }
}
