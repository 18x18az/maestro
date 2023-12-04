export enum CONTROL_MODE {
  AUTO = 'AUTO',
  DRIVER = 'DRIVER',
}

export interface FieldControlStatus {
  mode: CONTROL_MODE
  endTime: Date | null
}

export type FieldControlEndCb = (fieldId: number) => Promise<void>
