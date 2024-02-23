import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { StorageService } from '../storage'
import { parse, HTMLElement } from 'node-html-parser'
import { TeamInformation, TmStatus } from './tm.interface'
import { Cron } from '@nestjs/schedule'
import { TmConnectedEvent } from './tm-connected.event'
import { TeamListUpdateEvent } from '@/features/team/team-list-update.event'
import { EventResetEvent } from '@/features/stage/event-reset.event'
import axios, { AxiosResponse } from 'axios'
import { wrapper } from 'axios-cookiejar-support'
import { CookieJar } from 'tough-cookie'

const URL_KEY = 'tm'
const PASSWORD_KEY = 'tm-password'

@Injectable()
export class TmInternal {
  private readonly logger = new Logger(TmInternal.name)

  private tmUrl: URL | undefined
  private tmPassword: string | undefined
  private status: TmStatus = TmStatus.INITIALIZING
  private readonly cookieJar = new CookieJar()
  private readonly client = wrapper(axios.create({ jar: this.cookieJar }))

  constructor (
    private readonly storage: StorageService,
    private readonly connectedEvent: TmConnectedEvent,
    private readonly teamCreate: TeamListUpdateEvent,
    private readonly resetEvent: EventResetEvent
  ) {
    this.connectedEvent.registerOnComplete(this.loadTeams.bind(this))
    this.resetEvent.registerOnComplete(this.loadTeams.bind(this))
  }

  async onApplicationBootstrap (): Promise<void> {
    const loaded = await this.storage.getPersistent(URL_KEY, '')

    if (loaded === '') {
      this.status = TmStatus.NOT_CONFIGURED
      this.logger.warn('TM address not set')
      return
    }

    this.tmUrl = new URL(loaded)

    const password = await this.storage.getPersistent(PASSWORD_KEY, '')

    if (password === '') {
      this.status = TmStatus.AUTH_ERROR
      this.logger.warn('TM password not set')
      return
    }

    this.tmPassword = password

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
    if (this.status !== TmStatus.CONNECTED && this.status !== TmStatus.DISCONNECTED && this.status !== TmStatus.AUTH_ERROR) {
      return
    }

    await this.tryConnect()
  }

  private async tryConnect (): Promise<void> {
    const url = this.tmUrl
    if (url === undefined) {
      if (this.status !== TmStatus.NOT_CONFIGURED) {
        this.logger.warn('TM address not set')
        this.status = TmStatus.NOT_CONFIGURED
      }
      return
    }

    const isConnected = await this.tryURL(url)

    if (!isConnected) {
      if (this.status !== TmStatus.DISCONNECTED) {
        this.logger.warn('TM disconnected')
        this.status = TmStatus.DISCONNECTED
      }
      return
    }

    const password = this.tmPassword
    if (password === undefined) {
      if (this.status !== TmStatus.AUTH_ERROR) {
        this.logger.warn('TM password not set')
        this.status = TmStatus.AUTH_ERROR
      }
      return
    }

    const isLoggedIn = await this.tryLogin(password)

    if (!isLoggedIn) {
      if (this.status !== TmStatus.AUTH_ERROR) {
        this.logger.warn('Invalid TM password')
        this.status = TmStatus.AUTH_ERROR
      }
      return
    }

    if (this.status !== TmStatus.CONNECTED) {
      this.logger.log('TM Connected')
      await this.onConnect()
    }
  }

  private async tryURL (url: URL): Promise<boolean> {
    const response = await this.client.get(url.href)
    const data = JSON.stringify(response.data)

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

    const url = `${this.tmUrl.href}${resource}`

    const response = await this.client.get(url)

    const data = JSON.stringify(response.data)

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

  async sendJson (resource: string, data: Object): Promise<void> {
    const baseUrl = this.tmUrl
    if (baseUrl === undefined) {
      throw new Error('TM address not set')
    }

    const url = `${baseUrl.href}${resource}`

    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    }

    await this.client.post(url, data, config)
  }

  async submitFormData (resource: string, fields: Object): Promise<AxiosResponse> {
    const formData = new FormData()

    for (const [key, value] of Object.entries(fields)) {
      formData.append(key, value)
    }

    const baseUrl = this.tmUrl
    if (baseUrl === undefined) {
      throw new Error('TM address not set')
    }

    const url = `${baseUrl.href}${resource}`

    return await this.client.post(url, formData)
  }

  async tryLogin (password: string): Promise<boolean> {
    const data = {
      user: 'admin',
      password,
      submit: ''
    }

    const response = await this.submitFormData('admin/login', data)
    const body = JSON.stringify(response.data)

    if (body.includes('Invalid username or password')) {
      return false
    }

    return true
  }

  async setConfig (url: URL, password: string): Promise<TmStatus> {
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
    await this.storage.setPersistent(URL_KEY, url.toJSON())

    const isLoggedIn = await this.tryLogin(password)

    if (!isLoggedIn) {
      this.logger.warn('Invalid TM password')
      return TmStatus.AUTH_ERROR
    }

    this.logger.log('Authorized with TM')
    this.tmPassword = password
    await this.storage.setPersistent(PASSWORD_KEY, password)
    await this.connectedEvent.execute()
    return TmStatus.CONNECTED
  }
}
