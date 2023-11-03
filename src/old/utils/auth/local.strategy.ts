// import { Strategy } from 'passport-local'
// import { PassportStrategy } from '@nestjs/passport'
// import { Injectable, UnauthorizedException } from '@nestjs/common'
// import { AuthService } from './auth.service'
// import { UserValidation } from './auth.interface'
// import { User } from '../users/users.interface'

// @Injectable()
// export class LocalStrategy extends PassportStrategy(Strategy) {
//   constructor (private readonly authService: AuthService) {
//     super()
//   }

//   async validate (payload: UserValidation): Promise<User> {
//     const user = await this.authService.validateUser(payload)
//     if (user == null) {
//       throw new UnauthorizedException()
//     }
//     return user
//   }
// }
