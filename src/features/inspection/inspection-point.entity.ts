import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm'
import { InspectionGroupEntity } from './inspection-group.entity'
import { TeamEntity } from '../team/team.entity'

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

  @ManyToMany(() => TeamEntity, team => team.inspectionPointsMet)
    teamsMet: TeamEntity[]
}
