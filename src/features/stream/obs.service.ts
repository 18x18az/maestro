import { BaseStatus, StatusPublisher } from '@/utils'
import { Injectable, Logger } from '@nestjs/common'
import OBSWebSocket from 'obs-websocket-js'

const STATUS_TOPIC = 'obs'

@Injectable()
export class ObsService {
  private readonly obs: OBSWebSocket = new OBSWebSocket()
  private readonly logger: Logger = new Logger(ObsService.name)

  private isConnected: boolean = false

  private currentSceneName: string | undefined
  private currentPreviewSceneName: string | undefined

  constructor (
    private readonly status: StatusPublisher
  ) { }

  async onModuleInit (): Promise<void> {
    void this.tryConnect()
    this.obs.on('ConnectionClosed', this.onObsDisconnected.bind(this))
    this.obs.on('CurrentPreviewSceneChanged', this.onPreviewSceneChanged.bind(this))
    this.obs.on('CurrentProgramSceneChanged', this.onProgramSceneChanged.bind(this))
  }

  private async onPreviewSceneChanged (data: { sceneName: string }): Promise<void> {
    this.currentPreviewSceneName = data.sceneName
    this.logger.verbose(`Preview scene changed to ${data.sceneName}`)
  }

  private async onProgramSceneChanged (data: { sceneName: string }): Promise<void> {
    this.currentSceneName = data.sceneName
    this.logger.verbose(`Program scene changed to ${data.sceneName}`)
  }

  private async onObsConnected (): Promise<void> {
    await this.status.publishStatus(STATUS_TOPIC, BaseStatus.NOMINAL)
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
      await this.status.publishStatus(STATUS_TOPIC, BaseStatus.OFFLINE)
      this.isConnected = false
      this.logger.warn('Disconnected from OBS')
      await this.tryConnect()
    }
  }

  async setPreviewScene (sceneName: string): Promise<void> {
    this.logger.debug(`Requested preview scene change to ${sceneName}`)
    if (!this.isConnected) {
      this.logger.debug('Not connected to OBS')
      return
    }
    this.logger.log(`Setting preview scene to ${sceneName}`)
    await this.obs.call('SetCurrentPreviewScene', { sceneName })
    this.logger.debug('Preview scene set')
  }

  async triggerTransition (): Promise<void> {
    this.logger.debug('Requested transition')
    if (!this.isConnected) {
      this.logger.debug('Not connected to OBS')
      return
    }

    if (this.currentPreviewSceneName === this.currentSceneName) {
      this.logger.warn('Preview scene is the same as program scene')
      return
    }

    this.logger.log('Triggering transition')
    await this.obs.call('TriggerStudioModeTransition')
    this.logger.debug('Transition complete')
  }
}
