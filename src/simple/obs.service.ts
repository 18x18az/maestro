import { Injectable, Logger } from '@nestjs/common'
import OBSWebSocket from 'obs-websocket-js'
import { FieldStatus } from './simple.interface'

@Injectable()
export class ObsService {
  private readonly obs: OBSWebSocket = new OBSWebSocket()
  private readonly logger = new Logger(ObsService.name)

  constructor () {
    void this.connect()
  }

  async connect (): Promise<void> {
    await this.obs.connect('ws:/localhost:4455')
    await this.setPreviewScene('Field 2')
  }

  async setPreviewScene (sceneName: string): Promise<void> {
    this.logger.log(`Setting preview scene to ${sceneName}`)
    await this.obs.call('SetCurrentPreviewScene', { sceneName })
  }

  async readyMatch (field: FieldStatus): Promise<void> {
    const sceneName = field.name
    await this.setPreviewScene(sceneName)
  }

  async readyAudience (): Promise<void> {
    await this.setPreviewScene('Audience')
  }

  async triggerTransition (): Promise<void> {
    await this.obs.call('TriggerStudioModeTransition')
  }
}
