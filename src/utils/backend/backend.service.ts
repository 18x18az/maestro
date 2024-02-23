import { Injectable, Logger } from '@nestjs/common'
import { StorageService } from '../storage'
import { BackendStatus } from './backend.interface'
import { request, gql } from 'graphql-request'

const status = gql`
{
  connection {
    status
  }
}
`

interface Connection {
  connection: {
    status: string
  }
}

@Injectable()
export class BackendService {
  private readonly logger = new Logger(BackendService.name)
  private url: URL | undefined

  constructor (private readonly storage: StorageService) {}

  async onApplicationBootstrap (): Promise<void> {
    const url = await this.storage.getPersistent('backend.url', '')
    if (url !== '') {
      this.url = new URL(url)
      const result = await this.tryConnection()
      if (result === BackendStatus.CONNECTED) {
        this.logger.log('Backend connection established')
      } else {
        this.logger.warn('Backend connection failed')
        this.url = undefined
      }
    }
  }

  getUrl (): URL | undefined {
    return this.url
  }

  getStatus (): BackendStatus {
    return BackendStatus.NOT_CONFIGURED
  }

  async setConfig (url: URL): Promise<BackendStatus> {
    this.url = url
    const result = await this.tryConnection()
    if (result === BackendStatus.CONNECTED) {
      await this.storage.setPersistent('backend.url', url.href)
      this.logger.log('Backend connection established')
    } else {
      this.url = undefined
    }

    return result
  }

  private async tryConnection (): Promise<BackendStatus> {
    try {
      const result = await this.request(status) as Connection

      if (result.connection.status === 'REGULAR') {
        return BackendStatus.CONNECTED
      }
    } catch (error: any) {
      this.logger.warn('Connection failed', error.message)
    }

    return BackendStatus.NOT_CONFIGURED
  }

  private async request (document: string): Promise<unknown> {
    if (this.url === undefined) {
      return
    }

    const response = await request(this.url.href, document)
    return response
  }
}
