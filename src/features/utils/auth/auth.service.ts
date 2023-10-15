import { Injectable } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { UserValidation } from './auth.interface'
import * as crypto from 'crypto'
import * as bcrypt from 'bcrypt'
import { CreatedUser, User } from '../users/users.interface'

export type AuthResult = User | null

@Injectable()
export class AuthService {
  constructor (private readonly usersService: UsersService) {}

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

  async registerUser (): Promise<CreatedUser> {
    const token = crypto.randomBytes(32).toString('base64')
    const storedToken = bcrypt.hashSync(token, 10)
    const user = await this.usersService.createUser(storedToken)
    return { ...user, token }
  }
}
