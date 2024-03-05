import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { CameraEntity } from '../camera/camera.entity'

@Entity()
export class SceneEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column({ default: 'Unnamed Scene' })
    name: string

  @Column({ default: '' })
    key: string

  @OneToOne(() => CameraEntity, camera => camera.scene, { nullable: true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
    camera?: CameraEntity
}
