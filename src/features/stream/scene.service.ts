import { Injectable, Logger } from '@nestjs/common'
import { Camera } from './camera.service'
import { ObsService } from './obs.service'
import { HttpService } from '@nestjs/axios'
import { StreamPublisher } from './stream.publisher'
import { StreamDisplayStage } from './stream.interface'

export class Scene {
  private camera: Camera | null = null
  preset: number | null = null

  constructor (readonly name: string) {}

  setCamera (camera: Camera): void {
    this.camera = camera
  }

  async setPreset (preset: number): Promise<void> {
    if (this.camera === null) {
      throw new Error(`Camera not set for scene ${this.name}`)
    }

    await this.camera.set_desired_preset(preset)
    this.preset = preset
  }

  async setIsActiveScene (active: boolean): Promise<void> {
    if (this.camera !== null) {
      await this.camera.set_is_active_scene(active)
    }
  }
}

@Injectable()
export class SceneService {
  private programScene: string | undefined
  private previewScene: string | undefined

  private readonly logger: Logger = new Logger(SceneService.name)

  private readonly scenes: Scene[] = []
  constructor (
    private readonly obs: ObsService,
    private readonly request: HttpService,
    private readonly publisher: StreamPublisher
  ) {
    this.scenes.push(new Scene('Field 1'))
    this.scenes.push(new Scene('Field 2'))
    this.scenes.push(new Scene('Field 3'))
    const cameraIPs = ['1.1.1.1', '2.2.2.2', '3.3.3.3']
    for (const [i, ip] of cameraIPs.entries()) {
      this.scenes[i].setCamera(new Camera(ip, this.request))
    }
  }

  async onActiveSceneChange (sceneName: string): Promise<void> {
    this.programScene = sceneName
    for (const scene of this.scenes) {
      if (scene.name === sceneName) {
        await scene.setIsActiveScene(true)
      } else {
        await scene.setIsActiveScene(false)
      }
    }
  }

  async transition (): Promise<void> {
    if (this.previewScene === undefined) {
      throw new Error('Preview scene not set')
    }

    const previewScene = this.scenes.find(scene => scene.name === this.previewScene)
    if (previewScene === undefined) {
      throw new Error(`Preview scene ${this.previewScene} not found`)
    }

    if (this.programScene === this.previewScene) {
      this.logger.warn(`Preview scene ${this.previewScene} is already active`)
      return
    }

    await previewScene.setIsActiveScene(true)
    await this.publisher.publishDisplayStage(StreamDisplayStage.TRANSITIONING)
    await this.obs.transition()
  }

  onPreviewSceneChange (sceneName: string): void {
    this.previewScene = sceneName
  }

  async setPreviewScene (sceneName: string, preset?: number): Promise<void> {
    this.previewScene = sceneName
    const scene = this.scenes.find(scene => scene.name === sceneName)
    if (scene === undefined) {
      throw new Error(`Scene ${sceneName} not found`)
    }

    // check if scene is current program scene
    if (this.programScene === sceneName) {
      const currentPreset = this.scenes.find(scene => scene.name === this.programScene)?.preset
      if (currentPreset !== preset) {
        this.logger.warn(`Scene ${sceneName} is already active, but preset is different`)
      }
    }

    if (preset !== undefined) {
      await scene.setPreset(preset)
    }

    await this.obs.setPreviewScene(sceneName)
  }

  getUnusedScene (): string {
    const scene = this.scenes.find(scene => scene.name !== this.programScene && scene.name !== this.previewScene)
    if (scene === undefined) {
      throw new Error('No unused scene found')
    }
    return scene.name
  }
}
