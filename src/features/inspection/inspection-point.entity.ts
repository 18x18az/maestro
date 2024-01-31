import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm'
import { InspectionGroupEntity } from './inspection-group.entity'

@Entity()
@Unique(['text', 'group'])
export class InspectionPointEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column()
    text: string

  @Column()
    groupId: number

  @JoinColumn({ name: 'groupId' })
  @ManyToOne(() => InspectionGroupEntity, group => group.points)
    group: InspectionGroupEntity
}
