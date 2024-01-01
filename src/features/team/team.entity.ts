import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { Checkin } from './team.interface'

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
}
