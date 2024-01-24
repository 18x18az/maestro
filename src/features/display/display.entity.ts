import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { FieldEntity } from '../field/field.entity'

@Entity()
export class DisplayEntity {
  @PrimaryColumn()
    uuid: string

  @Column()
    name: string

  @Column({ nullable: true })
    fieldId: number

  @ManyToOne(() => FieldEntity, field => field.displays, { nullable: true })
  @JoinColumn({ name: 'fieldId', referencedColumnName: 'id' })
    field: FieldEntity
}
