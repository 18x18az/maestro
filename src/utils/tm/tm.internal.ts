import { HttpService } from '@nestjs/axios'
import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { StorageService } from '../storage'
import { catchError, firstValueFrom } from 'rxjs'
import { parse, HTMLElement } from 'node-html-parser'
import { TeamInformation, TmStatus } from './tm.interface'
import { Cron } from '@nestjs/schedule'
import { TmConnectedEvent } from './tm-connected.event'
import { TeamListUpdateEvent } from '../../features/team/team-list-update.event'

const STORAGE_KEY = 'tm'

@Injectable()
export class TmInternal {
  private readonly logger = new Logger(TmInternal.name)

  private tmUrl: URL | undefined
  private status: TmStatus = TmStatus.INITIALIZING

  constructor (
    private readonly request: HttpService,
    private readonly storage: StorageService,
    private readonly connectedEvent: TmConnectedEvent,
    private readonly teamCreate: TeamListUpdateEvent
  ) {
    this.connectedEvent.registerOnComplete(this.loadTeams.bind(this))
  }

  async onApplicationBootstrap (): Promise<void> {
    const loaded = await this.storage.getPersistent(STORAGE_KEY, '')

    if (loaded === '') {
      this.status = TmStatus.NOT_CONFIGURED
      this.logger.warn('TM address not set')
      return
    }

    this.tmUrl = new URL(loaded)

    this.status = TmStatus.DISCONNECTED
  }

  getUrl (): URL | undefined {
    return this.tmUrl
  }

  getStatus (): TmStatus {
    return this.status
  }

  async onDisconnect (): Promise<void> {
    this.logger.warn('Disconnected from TM')
    this.status = TmStatus.DISCONNECTED
  }

  async onConnect (): Promise<void> {
    this.status = TmStatus.CONNECTED
    await this.connectedEvent.execute()
  }

  @Cron('*/10 * * * * *')
  async handleCron (): Promise<void> {
    if (this.status !== TmStatus.CONNECTED && this.status !== TmStatus.DISCONNECTED) {
      return
    }

    await this.tryConnect()
  }

  private async tryConnect (): Promise<void> {
    const url = this.tmUrl
    if (url === undefined) {
      this.logger.warn('TM address not set')
      this.status = TmStatus.NOT_CONFIGURED
      return
    }

    const isConnected = await this.tryURL(url)

    if (isConnected && this.status !== TmStatus.CONNECTED) {
      await this.onConnect()
    } else if (!isConnected && this.status !== TmStatus.DISCONNECTED) {
      await this.onDisconnect()
    }
  }

  private async tryURL (url: URL): Promise<boolean> {
    const { data } = await firstValueFrom(
      this.request.get(url.href).pipe(
        catchError(async () => {
          return await Promise.resolve({ data: null })
        })
      )
    )

    if (data === null) {
      return false
    }

    const page = parse(data)
    const title = page.querySelector('title')
    if (title === null) {
      return false
    }

    const text = title.rawText

    if (!text.startsWith('Team List')) {
      return false
    }

    return true
  }

  private async getData (resource: string): Promise<HTMLElement | null> {
    if (this.tmUrl === undefined) {
      throw new Error('TM address not set')
    }

    if (this.status !== TmStatus.CONNECTED) {
      return null
    }

    const url = `${this.tmUrl.href}/${resource}`

    const { data } = await firstValueFrom(
      this.request.get(url).pipe(
        catchError(async () => {
          await this.onDisconnect()
          return await Promise.resolve({ data: null })
        })
      )
    )

    if (data === null) {
      await this.onDisconnect()
      return null
    }

    const page = parse(data)

    return page
  }

  async getTableData (resource: string): Promise<HTMLElement[] | null> {
    const page = await this.getData(resource)

    if (page === null) {
      return null
    }

    const table = page.querySelector('table')
    if (table === null) {
      return null
    }

    const rows = table.querySelectorAll('tr')
    if (rows.length === 0) {
      return null
    }

    return rows
  }

  private async loadTeams (): Promise<void> {
    const rows = await this.getTableData('division1/teams')
    if (rows === null) return

    const teams: TeamInformation[] = rows.flatMap(row => {
      const cells = row.querySelectorAll('td')
      const test = cells[0]

      if (test === undefined) {
        return []
      }

      const number = test.rawText
      const name = cells[1].rawText
      const location = cells[2].rawText
      const school = cells[3].rawText

      const team = { number, name, location, school }
      return team
    })

    this.logger.log(`Got ${teams.length} teams`)
    await this.teamCreate.execute({ teams })
  }

  async setURL (url: URL): Promise<void> {
    if (this.status === TmStatus.CONNECTED) {
      this.logger.warn('Attempted to set TM address while connected')
      throw new BadRequestException('TM already connected')
    }
    this.logger.log(`Trying TM at ${url.href}`)
    const isValid = await this.tryURL(url)

    if (!isValid) {
      this.logger.warn(`Invalid TM address ${url.href}`)
      throw new BadRequestException('Invalid TM address')
    }

    this.logger.log(`Connected to TM at ${url.href}`)
    this.tmUrl = url
    await this.storage.setPersistent(STORAGE_KEY, url.toJSON())
  }
}
