import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { SceneEntity } from './scene.entity'
import { Repository } from 'typeorm'
import { CameraEntity } from '../camera/camera.entity'
import { SwitcherInternal } from './switcher.internal'

@Injectable()
export class SwitcherService {
  private readonly logger = new Logger(SwitcherService.name)
  constructor (
    @InjectRepository(SceneEntity) private readonly sceneRepo: Repository<SceneEntity>,
    private readonly service: SwitcherInternal
  ) {}

  async findAll (): Promise<SceneEntity[]> {
    return await this.sceneRepo.find()
  }

  async findOne (id: number): Promise<SceneEntity> {
    return await this.sceneRepo.findOneOrFail({ where: { id } })
  }

  async programScene (): Promise<SceneEntity | undefined> {
    const id = this.service.getProgramScene()
    if (id === undefined) {
      return undefined
    }
    return await this.findOne(id)
  }

  async previewScene (): Promise<SceneEntity | undefined> {
    const id = this.service.getPreviewScene()
    if (id === undefined) {
      return undefined
    }
    return await this.findOne(id)
  }

  async addScene (): Promise<SceneEntity> {
    const scene = new SceneEntity()
    scene.name = 'Unnamed Scene'
    await this.sceneRepo.save(scene)
    this.logger.log(`Added scene ${scene.id}`)
    return scene
  }

  async removeScene (id: number): Promise<void> {
    await this.sceneRepo.delete(id)
    this.logger.log(`Removed scene ${id}`)
  }

  async editScene (id: number, data: Partial<SceneEntity>): Promise<SceneEntity> {
    const scene = await this.findOne(id)
    await this.sceneRepo.save({ ...scene, ...data })
    return scene
  }

  async findCamera (scene: SceneEntity): Promise<CameraEntity | undefined> {
    const sceneFull = await this.sceneRepo.findOneOrFail({ where: { id: scene.id }, relations: ['camera'] })
    return sceneFull.camera
  }

  async setPreviewScene (id: number): Promise<SceneEntity> {
    await this.service.setPreviewScene(id)
    this.logger.log(`Set preview scene to ${id}`)
    const scene = await this.previewScene()
    if (scene === undefined) throw new Error('Failed to set preview scene')
    return scene
  }

  async cutToScene (): Promise<void> {
    await this.service.cutToScene()
  }

  async transitionToScene (): Promise<void> {
    await this.service.transitionToScene()
  }
}
