import { ConfigModule } from '@nestjs/config'
import { AllianceSelectionModule, CompetitionModule, DisplayModule, ResultsModule, StreamModule } from '@/features'
import { Module } from '@nestjs/common'
import { PigeonModule, Transport } from '@alecmmiller/pigeon-mqtt-nest'
import { ScheduleModule } from '@nestjs/schedule'
import { BeaconService } from './utils'
import { SkillsModule } from './features/skills/skills.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AllianceSelectionModule,
    DisplayModule,
    StreamModule,
    CompetitionModule,
    ResultsModule,
    SkillsModule
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
