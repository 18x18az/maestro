import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Inspection } from './team.interface'
import { ContestEntity } from '../competition/match/contest.entity'
import { AwardEntity } from '../award/award.entity'
import { InspectionPointEntity } from '../inspection/inspection-point.entity'

@Entity()
export class TeamEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column({ unique: true })
    number: string

  @Column()
    name: string

  @Column()
    location: string

  @Column()
    school: string

  @Column({ enum: Inspection, type: 'simple-enum', default: Inspection.NOT_HERE })
    checkin: Inspection

  @ManyToMany(() => ContestEntity, contest => contest.redTeams, { onDelete: 'CASCADE' })
    redContests: ContestEntity[]

  @ManyToMany(() => ContestEntity, contest => contest.blueTeams, { onDelete: 'CASCADE' })
    blueContests: ContestEntity[]

  @ManyToMany(() => AwardEntity, award => award.winners, { nullable: true })
    awards: AwardEntity[]

  @ManyToMany(() => InspectionPointEntity, point => point.teamsMet)
  @JoinTable()
    inspectionPointsMet: InspectionPointEntity[]
}
