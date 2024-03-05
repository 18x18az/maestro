import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { CameraEntity } from './camera.entity'

@Entity()
export class PresetEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column()
    number: number

  @Column()
    name: string

  @ManyToOne(() => CameraEntity, camera => camera.presets)
    camera: CameraEntity
}
