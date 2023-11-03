
// import { Injectable } from '@nestjs/common'
// import { SetupConfig } from './setup.interface'
// import { SetupPublisher } from './setup.publisher'
// import { StorageService } from '@/old_utils/storage/storage.service'
// import { PublicFieldService } from '@/old/devices/field'

// @Injectable()
// export class SetupService {
//   constructor (private readonly fieldService: PublicFieldService, private readonly publisher: SetupPublisher, private readonly storage: StorageService) {}

//   async onApplicationBootstrap (): Promise<void> {
//     const existing = await this.storage.getEphemeral('eventName', '')

//     if (existing === '') {
//       return
//     }

//     await this.publisher.publishEventName(existing)
//   }

//   async setName (name: string): Promise<void> {
//     await this.storage.setEphemeral('eventName', name)
//     await this.publisher.publishEventName(name)
//   }

//   async initialConfig (config: SetupConfig): Promise<void> {
//     await this.fieldService.initialFields(config.fields)
//     await this.setName(config.eventName)
//     await this.publisher.publishReadyForTeams(true)
//   }

//   async handleStageChange (): Promise<void> {
//     await this.publisher.publishReadyForTeams(false)
//   }
// }
