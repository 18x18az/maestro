import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Inspection } from './team.interface'
import { AwardEntity } from '../award/award.entity'
import { InspectionPointEntity } from '../inspection/inspection-point.entity'
import { AllianceEntity } from '../competition/match/alliance.entity'

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

  @ManyToMany(() => AllianceEntity, alliance => alliance.team1, { onDelete: 'CASCADE' })
    captainedAlliances: AllianceEntity[]

  @ManyToMany(() => AllianceEntity, alliance => alliance.team2, { onDelete: 'CASCADE' })
    secondedAlliances: AllianceEntity[]

  @ManyToMany(() => AwardEntity, award => award.winners, { nullable: true, onDelete: 'CASCADE' })
    awards: AwardEntity[]

  @ManyToMany(() => InspectionPointEntity, point => point.teamsMet, { onDelete: 'CASCADE' })
  @JoinTable()
    inspectionPointsMet: InspectionPointEntity[]
}
