import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Checkin } from './team.interface'
import { ContestEntity } from '../competition/match/contest.entity'

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

  @Column({ enum: Checkin, type: 'simple-enum', default: Checkin.NOT_HERE })
    checkin: Checkin

  @ManyToMany(() => ContestEntity, contest => contest.redTeams, { onDelete: 'CASCADE' })
    redContests: ContestEntity[]

  @ManyToMany(() => ContestEntity, contest => contest.blueTeams, { onDelete: 'CASCADE' })
    blueContests: ContestEntity[]
}
