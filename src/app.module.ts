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

@Module({
  imports: [
    ConfigModule.forRoot(),
    PigeonModule.forRoot({
      transport: Transport.WS,
      port: 1883
    }),
    SetupModule,
    DivisionModule,
    InspectionModule,
    InMemoryDBModule.forRoot({}),
    StageModule,
    StorageModule,
    QualScheduleModule
  ]
})
export class AppModule {}