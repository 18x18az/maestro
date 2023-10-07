import { Module } from '@nestjs/common'
import { PigeonModule, Transport } from 'pigeon-mqtt-nest'
import { ConfigModule } from '@nestjs/config'
import { SetupModule } from './features/initial/setup/setup.module'
import { DivisionModule } from './features/division/division.module'
import { InspectionModule } from './features/initial/inspection/inspection.module'
import { InMemoryDBModule } from '@nestjs-addons/in-memory-db'
import { StageModule } from './features/stage/stage.module'
import { StorageModule } from './utils/storage/storage.module'
import { QualScheduleModule } from './features/initial/qual-schedule/qual-schedule.module'
import { BeaconService } from './utils/discovery'
import { DisplaysModule } from './features/devices/displays/displays.module'
import { FieldsModule } from './features/devices/fields/fields.module'
import { FieldSetModule } from './features/competition/fieldSet/fieldSet.module'
import { MatchScoreModule } from './features/competition/matchScore/matchScore.module'
import { SkillsScoreModule } from './features/competition/skillsScore/skillsScore.module'
import { MockModule } from './features/mock/mock.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SetupModule,
    DivisionModule,
    InspectionModule,
    InMemoryDBModule.forRoot({}),
    StageModule,
    StorageModule,
    QualScheduleModule,
    DisplaysModule,
    FieldsModule,
    FieldSetModule,
    MatchScoreModule,
    SkillsScoreModule,
    MockModule
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
