import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { SittingStatus } from './match.interface'
import { FieldEntity } from '../../field/field.entity'
import { BlockEntity } from './block.entity'
import { MatchEntity } from './match.entity'

@Entity()
export class SittingEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column({ type: 'int', default: 1 })
    number: number

  @Column({ type: 'datetime', nullable: true })
    scheduled: Date

  @Column({ nullable: true })
    fieldId: number

  @ManyToOne(() => FieldEntity, field => field.sittings, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fieldId', referencedColumnName: 'id' })
    field: FieldEntity

  @Column()
    blockId: number

  @ManyToOne(() => BlockEntity, block => block.sittings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blockId', referencedColumnName: 'id' })
    block: BlockEntity

  @Column()
    matchId: number

  @ManyToOne(() => MatchEntity, match => match.sittings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'matchId', referencedColumnName: 'id' })
    match: MatchEntity

  @Column({ type: 'simple-enum', enum: SittingStatus, default: SittingStatus.NOT_STARTED })
    status: SittingStatus
}
