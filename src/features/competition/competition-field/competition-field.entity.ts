import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { FieldEntity } from '../../field/field.entity'
import { SittingEntity } from '../match/sitting.entity'

@Entity()
export class CompetitionFieldEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column()
    fieldId: number

  @JoinColumn({ name: 'fieldId' })
  @OneToOne(() => FieldEntity)
    field: FieldEntity

  @Column({ nullable: true })
    onFieldSittingId: number | null

  @JoinColumn({ name: 'onFieldSittingId' })
  @OneToOne(() => SittingEntity, { nullable: true, onDelete: 'CASCADE' })
    onFieldSitting: SittingEntity | null

  @Column({ nullable: true })
    onTableSittingId: number | null

  @JoinColumn({ name: 'onTableSittingId' })
  @OneToOne(() => SittingEntity, { nullable: true, onDelete: 'CASCADE' })
    onTableSitting: SittingEntity | null
}
