import { Injectable, Logger } from '@nestjs/common'
import OBSWebSocket from 'obs-websocket-js'
import { DisplayState, FieldStatus } from './simple.interface'
import { SimplePublisher } from './simple.publisher'

@Injectable()
export class ObsService {
  private readonly obs: OBSWebSocket = new OBSWebSocket()
  private readonly logger = new Logger(ObsService.name)

  private previewState: DisplayState | null = null

  constructor (private readonly publisher: SimplePublisher) {
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
    this.previewState = DisplayState.IN_MATCH
  }

  async readyAudience (): Promise<void> {
    await this.setPreviewScene('Audience')
    this.previewState = DisplayState.RESULTS
  }

  async triggerTransition (): Promise<void> {
    if (this.previewState === null) {
      this.logger.warn('Attempted to transition without a known preview state')
      return
    }
    await this.obs.call('TriggerStudioModeTransition')
    await this.publisher.publishDisplayState(this.previewState)
    this.previewState = null
  }
}
