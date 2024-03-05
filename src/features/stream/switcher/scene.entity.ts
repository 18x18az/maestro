import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { CameraEntity } from '../camera/camera.entity'
import { FieldEntity } from '../../field/field.entity'

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

  @OneToMany(() => FieldEntity, field => field.scene, { nullable: true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
    fields: FieldEntity[]
}
