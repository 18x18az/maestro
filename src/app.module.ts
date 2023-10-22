import { Module } from '@nestjs/common'
import { PigeonModule, Transport } from '@alecmmiller/pigeon-mqtt-nest'
import { ConfigModule } from '@nestjs/config'
import { SetupModule } from './features/initial/setup/setup.module'
import { DivisionModule } from './features/division/division.module'
import { InspectionModule } from './features/initial/inspection/inspection.module'
import { InMemoryDBModule } from '@nestjs-addons/in-memory-db'
import { StageModule } from './features/stage/stage.module'
import { StorageModule } from './utils/storage/storage.module'
import { BeaconService } from './utils/discovery'
import { DisplaysModule } from './features/devices/displays/displays.module'
import { FieldModule } from './features/devices/field/field.module'
import { FieldSetModule } from './features/competition/fieldSet/fieldSet.module'
import { SkillsScoreModule } from './features/competition/skillsScore/skillsScore.module'
import { MockModule } from './features/mock/mock.module'
import { AuthModule } from './features/utils/auth/auth.module'
import { MatchScoreModule, QualListModule, QueueingModule } from '@/features'
import { TeamModule } from './features/initial/team/team.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DivisionModule,
    InspectionModule,
    InMemoryDBModule.forRoot({}),
    StageModule,
    StorageModule,
    QualListModule,
    DisplaysModule,
    FieldModule,
    FieldSetModule,
    MatchScoreModule,
    SkillsScoreModule,
    MockModule,
    TeamModule,
    AuthModule,
    SetupModule,
    QueueingModule
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
