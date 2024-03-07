import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { SceneEntity } from './scene.entity'
import { Repository } from 'typeorm'
import { CameraEntity } from '../camera/camera.entity'

@Injectable()
export class SwitcherService {
  private readonly logger = new Logger(SwitcherService.name)
  constructor (
    @InjectRepository(SceneEntity) private readonly sceneRepo: Repository<SceneEntity>
  ) {}

  async findAll (): Promise<SceneEntity[]> {
    return await this.sceneRepo.find()
  }

  async findOne (id: number): Promise<SceneEntity> {
    return await this.sceneRepo.findOneOrFail({ where: { id } })
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
}
