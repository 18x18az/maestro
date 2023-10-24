import { Module } from '@nestjs/common'
import { PigeonModule, Transport } from '@alecmmiller/pigeon-mqtt-nest'
import { BeaconService } from './utils/discovery'
import { ConfigModule } from '@nestjs/config'
import { SimpleModule } from './simple/simple.module'
import { StorageModule } from './utils/storage/storage.module'

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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SimpleModule,
    StorageModule
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
  ],
  providers: [BeaconService]
})
export class AppModule {}
