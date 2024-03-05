import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { PresetEntity } from './preset.entity'
import { SceneEntity } from '../switcher/scene.entity'

@Entity()
export class CameraEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column()
    ip: string

  @Column({ default: 'Unnamed Camera' })
    name: string

  @OneToMany(() => PresetEntity, preset => preset.camera)
    presets: PresetEntity[]

  @Column()
    sceneId: number

  @JoinColumn({ name: 'sceneId' })
  @OneToOne(() => SceneEntity, scene => scene.camera, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
    scene: SceneEntity
}
