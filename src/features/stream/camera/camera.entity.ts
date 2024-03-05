import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { PresetEntity } from './preset.entity'

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
}
