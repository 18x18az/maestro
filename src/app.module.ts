// @Module({
//   imports: [
//     ConfigModule.forRoot({ isGlobal: true }),
//     DivisionModule,
//     InspectionModule,
//     InMemoryDBModule.forRoot({}),
//     StageModule,
//     StorageModule,
//     QualListModule,
//     DisplaysModule,
//     FieldModule,
//     FieldSetModule,
//     MatchScoreModule,
//     SkillsScoreModule,
//     MockModule,
//     TeamModule,
//     AuthModule,
//     SetupModule,
//     QueueingModule
//   ]
// })
// export class WithoutPigeonModule {}

import { ConfigModule } from '@nestjs/config'
import { FieldControlModule, MatchModule } from '@/features'
import { Module } from '@nestjs/common'
import { PigeonModule, Transport } from '@alecmmiller/pigeon-mqtt-nest'
import { TmModule } from './utils'

// @Module({
//   imports: [
//     ConfigModule.forRoot({ isGlobal: true }),
//     SimpleModule,
//     StorageModule,
//     DisplaysModule,
//     ScheduleModule.forRoot()
//   ]
// })
// export class WithoutPigeonModule {}

// @Module({
//   imports: [
//     WithoutPigeonModule,
//     PigeonModule.forRoot({
//       transport: Transport.WS,
//       port: 1883
//     })
//   ],
//   providers: [BeaconService]
// })
// export class AppModule {}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TmModule,
    MatchModule,
    FieldControlModule
  ]
})
export class WithoutPigeonModule {}

@Module({
  imports: [
    WithoutPigeonModule,
    PigeonModule.forRoot({
      transport: Transport.WS,
      port: 1883
    })
  ]
})
export class AppModule {}
