// import { Body, Controller, Post } from '@nestjs/common'
// import { AuthService } from './auth.service'
// import { CreatedUser } from '../users/users.interface'
// import { UserValidation } from './auth.interface'
// import { RealIp } from 'nestjs-real-ip'

// @Controller('auth')
// export class AuthController {
//   constructor (private readonly service: AuthService) {}

//   @Post('login')
//   async login (@Body() identity: UserValidation): Promise<boolean> {
//     const result = await this.service.validateUser(identity)
//     if (result === null) {
//       return false
//     } else {
//       return true
//     }
//   }

//   @Post('register')
//   async register (@RealIp() ip: string): Promise<CreatedUser> {
//     return await this.service.registerUser(ip)
//   }
// }
