import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm'
import { Program } from './inspection.interface'
import { InspectionPointEntity } from './inspection-point.entity'

@Entity()
@Unique(['program', 'text'])
export class InspectionGroupEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column()
    text: string

  @Column({ enum: Program, type: 'simple-enum' })
    program: Program

  @OneToMany(() => InspectionPointEntity, point => point.group)
    points: InspectionPointEntity[]
}
