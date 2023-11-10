import { HttpService } from '@nestjs/axios'
import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { StorageService } from '../storage'
import { catchError, firstValueFrom } from 'rxjs'
import { parse, HTMLElement } from 'node-html-parser'
import { TeamInformation } from './tm.interface'
import { TmPublisher } from './tm.publisher'
import { Cron } from '@nestjs/schedule'
import { BaseStatus, StatusPublisher } from '../status'
import { EventStage } from '@/features'

const STORAGE_KEY = 'tm'
const STATUS_TOPIC = 'tm'

@Injectable()
export class TmInternal {
  private readonly logger = new Logger(TmInternal.name)

  private tmAddr: string | undefined
  private isConnected: boolean | undefined

  constructor (
    private readonly request: HttpService,
    private readonly storage: StorageService,
    private readonly publisher: TmPublisher,
    private readonly status: StatusPublisher
  ) { }

  async onModuleInit (): Promise<void> {
    const loaded = await this.storage.getPersistent(STORAGE_KEY, '')

    if (loaded === '') {
      await this.status.publishStatus(STATUS_TOPIC, BaseStatus.NOT_CONFIGURED)
      return
    }

    this.tmAddr = loaded

    const isUp = await this.tryAddress(loaded)

    if (!isUp) {
      await this.onDisconnect()
      return
    }

    this.logger.log(`Connected to TM at ${loaded}`)
    await this.loadTeams()
  }

  async onDisconnect (): Promise<void> {
    if (this.isConnected === true || this.isConnected === undefined) {
      await this.status.publishStatus(STATUS_TOPIC, BaseStatus.OFFLINE)
      this.isConnected = false
      this.logger.warn(`TM at ${this.tmAddr as string} is not responding`)
      void this.tryReconnect()
    }
  }

  async tryReconnect (): Promise<void> {
    if (this.isConnected === true) {
      return
    }

    const isConnected = await this.tryConnect()

    if (isConnected) {
      this.logger.log(`Reconnected to TM at ${this.tmAddr as string}`)
      this.isConnected = true
    } else {
      setTimeout(() => { void this.tryReconnect() }, 2500)
    }
  }

  @Cron('*/10 * * * * *')
  async handleCron (): Promise<void> {
    if (this.isConnected === false || this.tmAddr === undefined) {
      return
    }

    const stillConnected = await this.tryConnect()

    if (!stillConnected) {
      await this.onDisconnect()
    }
  }

  private async tryConnect (): Promise<boolean> {
    if (this.tmAddr === undefined) {
      this.logger.warn('TM address not set')
      this.isConnected = false
      return false
    }

    return await this.tryAddress(this.tmAddr)
  }

  private async tryAddress (addr: string): Promise<boolean> {
    const url = `http://${addr}`
    const { data } = await firstValueFrom(
      this.request.get(url).pipe(
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

    this.isConnected = true
    await this.status.publishStatus(STATUS_TOPIC, BaseStatus.NOMINAL)
    return true
  }

  private async getData (resource: string): Promise<HTMLElement | null> {
    if (this.tmAddr === undefined) {
      throw new Error('TM address not set')
    }

    if (this.isConnected === false) {
      return null
    }

    const url = `http://${this.tmAddr}/${resource}`

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
    await this.publisher.publishTeams(teams)
  }

  async onStageChange (stage: EventStage): Promise<void> {
    if (stage === EventStage.WAITING_FOR_TEAMS && this.isConnected === true) {
      await this.loadTeams()
    }
  }

  async setAddress (addr: string): Promise<void> {
    this.logger.log(`Trying TM at ${addr}`)
    const isValid = await this.tryAddress(addr)

    if (!isValid) {
      this.logger.warn(`Invalid TM address ${addr}`)
      throw new BadRequestException('Invalid TM address')
    }

    this.logger.log(`Connected to TM at ${addr}`)
    this.tmAddr = addr
    await this.storage.setPersistent(STORAGE_KEY, addr)
    await this.loadTeams()
  }
}
