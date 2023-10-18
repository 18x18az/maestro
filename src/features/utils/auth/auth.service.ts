import { Injectable } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { UserValidation } from './auth.interface'
import * as crypto from 'crypto'
import * as bcrypt from 'bcrypt'
import { CreatedUser, User } from '../users/users.interface'
import { networkInterfaces } from 'os'

export type AuthResult = User | null

@Injectable()
export class AuthService {
  constructor (private readonly usersService: UsersService) {}
  private readonly localAddrs: string[] = []

  async onApplicationBootstrap (): Promise<void> {
    const nets = networkInterfaces()
    for (const net of Object.values(nets)) {
      if (net === undefined) continue
      for (const netInterface of net) {
        if (netInterface.family === 'IPv4' && !netInterface.internal) {
          this.localAddrs.push(netInterface.address)
        }
      }
    }
  }

  async validateUser (payload: UserValidation): Promise<AuthResult> {
    const user = await this.usersService.findOne(payload.id)
    if (user === null) {
      return null
    }

    const { hashedToken, ...result } = user

    const isCorrectKey = await bcrypt.compare(payload.token, hashedToken)

    if (isCorrectKey === false) {
      return null
    }

    return result
  }

  async registerUser (ip: string): Promise<CreatedUser> {
    const isLocal = this.localAddrs.includes(ip)
    const token = crypto.randomBytes(32).toString('base64')
    const storedToken = bcrypt.hashSync(token, 10)
    const user = await this.usersService.createUser(storedToken, isLocal)
    return { ...user, token }
  }
}
