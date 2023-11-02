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
import { FieldControlModule, MatchModule, ResultsModule } from '@/features'
import { Module } from '@nestjs/common'
import { PigeonModule, Transport } from '@alecmmiller/pigeon-mqtt-nest'
import { ScheduleModule } from '@nestjs/schedule'
import { BeaconService } from './utils'

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
    MatchModule,
    FieldControlModule,
    ResultsModule
  ]
})
export class WithoutPigeonModule {}

@Module({
  imports: [
    WithoutPigeonModule,
    PigeonModule.forRoot({
      transport: Transport.WS,
      port: 1883
    }),
    ScheduleModule.forRoot()
  ],
  providers: [BeaconService]
})
export class AppModule {}
