import { registerEnumType } from '@nestjs/graphql'

export enum BackendStatus {
  NOT_CONFIGURED = 'NOT_CONFIGURED',
  AUTH_ERROR = 'AUTH_ERROR',
  CONNECTED = 'CONNECTED',
}

registerEnumType(BackendStatus, { name: 'BackendStatus' })
