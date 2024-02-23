import { Injectable } from '@nestjs/common'
import { StorageService } from '../storage'
import { BackendStatus } from './backend.interface'

@Injectable()
export class BackendService {
  constructor (private readonly storage: StorageService) {}

  getUrl (): URL | undefined {
    return undefined
  }

  getStatus (): BackendStatus {
    return BackendStatus.NOT_CONFIGURED
  }

  async setConfig (url: URL): Promise<BackendStatus> {
    return BackendStatus.NOT_CONFIGURED
  }
}
