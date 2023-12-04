import { ConfigModule } from '@nestjs/config'
import { AllianceSelectionModule, CompetitionControlModule, DisplayModule, FieldControlModule, MatchModule, ResultsModule, StreamModule } from '@/features'
import { Module } from '@nestjs/common'
import { PigeonModule, Transport } from '@alecmmiller/pigeon-mqtt-nest'
import { ScheduleModule } from '@nestjs/schedule'
import { BeaconService } from './utils'
import { CompetitionFieldModule } from './features/competition-field/competition-field.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MatchModule,
    FieldControlModule,
    ResultsModule,
    AllianceSelectionModule,
    DisplayModule,
    StreamModule,
    CompetitionFieldModule,
    CompetitionControlModule
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
