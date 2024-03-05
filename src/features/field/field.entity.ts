import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { SittingEntity } from '../competition/match/sitting.entity'
import { DisplayEntity } from '../display/display.entity'
import { SceneEntity } from '../stream/switcher/scene.entity'

@Entity()
export class FieldEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column()
    name: string

  @Column({ default: false })
    isCompetition: boolean

  @Column({ default: false })
    skillsEnabled: boolean

  @Column({ default: false })
    isEnabled: boolean

  @OneToMany(() => SittingEntity, sitting => sitting.field)
    sittings: SittingEntity[]

  @OneToMany(() => DisplayEntity, display => display.field)
    displays: DisplayEntity[]

  @Column({ nullable: true })
    sceneId: number

  @JoinColumn({ name: 'sceneId' })
  @ManyToOne(() => SceneEntity, scene => scene.fields, { nullable: true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
    scene: SceneEntity
}
