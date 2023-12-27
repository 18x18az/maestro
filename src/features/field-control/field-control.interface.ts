import { registerEnumType } from '@nestjs/graphql'

export enum CONTROL_MODE {
  AUTO = 'AUTO',
  DRIVER = 'DRIVER',
}

registerEnumType(CONTROL_MODE, {
  name: 'CONTROL_MODE'
})

export interface FieldControlStatus {
  fieldId: number
  mode: CONTROL_MODE | undefined
  endTime: Date | null
  duration: number | null
}
