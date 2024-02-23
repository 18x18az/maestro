import { registerEnumType } from '@nestjs/graphql'

export enum BackendStatus {
  INITIALIZING = 'INITIALIZING',
  NOT_CONFIGURED = 'NOT_CONFIGURED',
  AUTH_ERROR = 'AUTH_ERROR',
  DISCONNECTED = 'DISCONNECTED',
  CONNECTED = 'CONNECTED',
}

registerEnumType(BackendStatus, { name: 'BackendStatus' })
