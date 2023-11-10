import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { catchError, firstValueFrom } from 'rxjs'
import { BaseStatus } from './status.interface'
import { StatusPublisher } from './status.publisher'

const SITES_TO_CHECK = ['spotify.com', '18x18az.org', 'robotevents.com', 'pretzel.rocks']

@Injectable()
export class NetworkMonitor {
  private readonly logger: Logger = new Logger(NetworkMonitor.name)
  private networkStatus = BaseStatus.NOMINAL

  constructor (
    private readonly request: HttpService,
    private readonly status: StatusPublisher
  ) {}

  @Cron('*/10 * * * * *')
  async handleCron (): Promise<void> {
    const checks = await Promise.all(SITES_TO_CHECK.map(async site => {
      const { data } = await firstValueFrom(
        this.request.get(`http://${site}`).pipe(
          catchError(async () => {
            return await Promise.resolve({ data: null })
          })
        )
      )

      const isUp = data !== null

      return { site, isUp }
    }))

    if (this.networkStatus !== BaseStatus.NOMINAL && checks.every(({ isUp }) => isUp)) {
      this.networkStatus = BaseStatus.NOMINAL
      this.logger.log('Internet connection appears nominal')
      await this.status.publishStatus('network', BaseStatus.NOMINAL, { checks })
    } else if (this.networkStatus !== BaseStatus.DEGRADED && checks.some(({ isUp }) => isUp) && checks.some(({ isUp }) => !isUp)) {
      this.networkStatus = BaseStatus.DEGRADED
      this.logger.warn('Some sites appear to be blocked')
      this.logger.warn(checks.filter(({ isUp }) => !isUp).map(({ site }) => site).join(', '))
      await this.status.publishStatus('network', BaseStatus.DEGRADED, { checks })
    } else if (this.networkStatus !== BaseStatus.OFFLINE && checks.every(({ isUp }) => !isUp)) {
      this.networkStatus = BaseStatus.OFFLINE
      this.logger.warn('Internet connection appears offline')
      await this.status.publishStatus('network', BaseStatus.OFFLINE, { checks })
    }
  }
}
