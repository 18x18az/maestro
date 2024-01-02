import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { SittingStatus } from './match.interface'
import { FieldEntity } from '../../field/field.entity'
import { BlockEntity } from './block.entity'
import { MatchEntity } from './match.entity'

@Entity()
export class SittingEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column({ type: 'date', nullable: true })
    scheduled: Date

  @ManyToOne(() => FieldEntity, field => field.sittings, { nullable: true })
    field: FieldEntity

  @ManyToOne(() => BlockEntity, block => block.sittings)
    block: BlockEntity

  @ManyToOne(() => MatchEntity, match => match.sittings)
    match: MatchEntity

  @Column({ type: 'simple-enum', enum: SittingStatus, default: SittingStatus.NOT_STARTED })
    status: SittingStatus
}
