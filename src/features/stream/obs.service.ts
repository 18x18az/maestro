import { Injectable, Logger } from '@nestjs/common'
import OBSWebSocket from 'obs-websocket-js'
import { EventEmitter } from 'events'

@Injectable()
export class ObsService {
  private readonly obs: OBSWebSocket = new OBSWebSocket()
  private readonly logger: Logger = new Logger(ObsService.name)

  private readonly emitter: EventEmitter = new EventEmitter()

  private isConnected: boolean = false

  private currentSceneName: string | undefined
  private currentPreviewSceneName: string | undefined

  async onModuleInit (): Promise<void> {
    void this.tryConnect()
    this.obs.on('ConnectionClosed', this.onObsDisconnected.bind(this))
    this.obs.on('CurrentPreviewSceneChanged', this.onPreviewSceneChanged.bind(this))
    this.obs.on('CurrentProgramSceneChanged', this.onProgramSceneChanged.bind(this))
  }

  getCurrentSceneName (): string | undefined {
    return this.currentSceneName
  }

  private async onPreviewSceneChanged (data: { sceneName: string }): Promise<void> {
    this.currentPreviewSceneName = data.sceneName
  }

  private async onProgramSceneChanged (data: { sceneName: string }): Promise<void> {
    this.currentSceneName = data.sceneName
    this.emitter.emit('activeSceneChange', data.sceneName)
  }

  private async onObsConnected (): Promise<void> {
    this.isConnected = true
    this.logger.log('Connected to OBS')
  }

  private async tryConnect (): Promise<void> {
    try {
      await this.obs.connect('ws://localhost:4455')
      await this.onObsConnected()
    } catch (error) {
      setTimeout(() => { void this.tryConnect() }, 1000)
    }
  }

  private async onObsDisconnected (): Promise<void> {
    if (this.isConnected) {
      this.isConnected = false
      this.logger.warn('Disconnected from OBS')
      await this.tryConnect()
    }
  }

  async setPreviewScene (sceneName: string): Promise<void> {
    if (!this.isConnected) {
      this.logger.debug('Not connected to OBS')
      return
    }
    await this.obs.call('SetCurrentPreviewScene', { sceneName })
  }

  async transition (): Promise<void> {
    if (!this.isConnected) {
      return
    }

    if (this.currentPreviewSceneName === undefined) {
      this.logger.warn('Preview scene is undefined')
      return
    }

    if (this.currentPreviewSceneName === this.currentSceneName) {
      this.logger.warn('Preview scene is the same as program scene')
      return
    }

    await this.obs.call('TriggerStudioModeTransition')

    return await new Promise((resolve) => {
      this.emitter.once('activeSceneChange', () => {
        resolve()
      })
    })
  }
}
