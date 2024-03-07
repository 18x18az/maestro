import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import OBSWebSocket from 'obs-websocket-js'
import { SceneEntity } from './scene.entity'
import { Repository } from 'typeorm'
import { EventEmitter } from 'events'
import { OnLiveEvent, OnLiveEventContext } from '../../competition/competition/on-live.event'
import { FieldService } from '../../field/field.service'
import { LiveRemovedEvent } from '../../competition/competition/live-removed.event'
import { CompetitionControlService } from '../../competition/competition/competition.service'
import { SolidDisplayRepo } from '../solid-display/solid-display.repo'
import { OnDeckEvent, OnDeckEventContext } from '../../competition/competition/on-deck.event'

@Injectable()
export class SwitcherInternal {
  private readonly logger: Logger = new Logger(SwitcherInternal.name)

  private previewScene?: number
  private programScene?: number

  private readonly obs: OBSWebSocket = new OBSWebSocket()
  private isConnected: boolean = false
  private readonly emitter: EventEmitter = new EventEmitter()

  private needsOnDeckField = true

  constructor (
    @InjectRepository(SceneEntity) private readonly sceneRepository: Repository<SceneEntity>,
    onLive: OnLiveEvent,
    liveRemoved: LiveRemovedEvent,
    competition: CompetitionControlService,
    fields: FieldService,
    solid: SolidDisplayRepo,
    onDeck: OnDeckEvent
  ) {
    onLive.registerBefore(async (data: OnLiveEventContext) => {
      await this.transitionToScene()
    })
    onLive.registerOnComplete(async (data: OnLiveEventContext) => {
      this.needsOnDeckField = false
      const solidScene = await solid.getSolidDisplaySceneId()
      if (solidScene === undefined) return
      await this.setPreviewScene(solidScene)
    })
    onDeck.registerOnComplete(async (data: OnDeckEventContext) => {
      if (!this.needsOnDeckField) return

      const scene = await fields.getScene(data.fieldId)
      await this.setPreviewScene(scene.id)
    })
    liveRemoved.registerBefore(async () => {
      await this.transitionToScene()
      this.needsOnDeckField = true
    })
    liveRemoved.registerOnComplete(async () => {
      const onDeck = await competition.getOnDeckField()
      if (onDeck === null) return
      await this.setPreviewScene(onDeck.sceneId)
    })
  }

  async onModuleInit (): Promise<void> {
    void this.tryConnect()
    this.obs.on('ConnectionClosed', this.onObsDisconnected.bind(this))
    this.obs.on('CurrentPreviewSceneChanged', this.onPreviewSceneChanged.bind(this))
    this.obs.on('CurrentProgramSceneChanged', this.onProgramSceneChanged.bind(this))
  }

  private async onPreviewSceneChanged (data: { sceneName: string }): Promise<void> {
    const scene = await this.sceneRepository.findOne({ where: { key: data.sceneName } })

    if (scene === null) {
      this.logger.warn(`Scene ${data.sceneName} not found in database`)
      this.previewScene = undefined
      return
    }

    this.previewScene = scene.id
  }

  private async onProgramSceneChanged (data: { sceneName: string }): Promise<void> {
    const scene = await this.sceneRepository.findOne({ where: { key: data.sceneName } })

    if (scene === null) {
      this.logger.warn(`Scene ${data.sceneName} not found in database`)
      this.programScene = undefined
      this.emitter.emit('activeSceneChange', undefined)
      return
    }
    this.programScene = scene.id

    this.emitter.emit('activeSceneChange', scene.id)
  }

  private async tryConnect (): Promise<void> {
    try {
      await this.obs.connect('ws://localhost:4455')
      await this.onObsConnected()
    } catch (error) {
      setTimeout(() => { void this.tryConnect() }, 1000)
    }
  }

  private async onObsConnected (): Promise<void> {
    this.isConnected = true
    this.logger.log('Connected to OBS')
  }

  private async onObsDisconnected (): Promise<void> {
    if (this.isConnected) {
      this.isConnected = false
      this.logger.warn('Disconnected from OBS')
      await this.tryConnect()
    }
  }

  private sceneChanged (): void {
    this.programScene = this.previewScene
    this.previewScene = undefined
  }

  async cutToScene (): Promise<void> {
    if (this.previewScene === undefined) {
      throw new BadRequestException('No preview scene set')
    }

    await this.obs.call('SetCurrentSceneTransition', { transitionName: 'Cut' })
    await this.obs.call('TriggerStudioModeTransition')

    return await new Promise((resolve) => {
      this.emitter.once('activeSceneChange', () => {
        resolve()
      })
    })
  }

  async transitionToScene (): Promise<void> {
    if (this.previewScene === undefined) {
      throw new BadRequestException('No preview scene set')
    }

    if (!this.isConnected) {
      this.sceneChanged()
      return
    }

    await this.obs.call('SetCurrentSceneTransition', { transitionName: 'Stinger' })
    await this.obs.call('TriggerStudioModeTransition')

    return await new Promise((resolve) => {
      this.emitter.once('activeSceneChange', () => {
        resolve()
      })
    })
  }

  async setPreviewScene (id: number): Promise<void> {
    this.previewScene = id
    if (!this.isConnected) {
      this.logger.debug('Not connected to OBS')
      return
    }

    const scene = await this.sceneRepository.findOneOrFail({ where: { id } })

    await this.obs.call('SetCurrentPreviewScene', { sceneName: scene.key })
  }

  getProgramScene (): number | undefined {
    return this.programScene
  }

  getPreviewScene (): number | undefined {
    return this.previewScene
  }
}
