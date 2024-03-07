import { ConfigModule } from '@nestjs/config'
import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { GraphQLModule } from '@nestjs/graphql'
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius'
import { join } from 'path'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FieldControlModule } from './features/field-control/field-control.module'
import { TeamModule } from './features/team/team.module'
import { SettingsModule } from './utils/settings/settings.module'
import { URLResolver } from 'graphql-scalars'
import { StageModule } from './features/stage/stage.module'
import { CompetitionModule } from './features/competition/competition/competition.module'
import { BeaconService } from './utils/discovery'
import { MatchModule } from './features/competition/match/match.module'
import { ResultsModule } from './features/results/results.module'
import { DisplayModule } from './features/display/display.module'
import { AllianceSelectionModule } from './features/alliance-selection'
import { TimeoutModule } from './features/competition/timeout/timeout.module'
import { AwardModule } from './features/award/award.module'
import { InspectionModule } from './features/inspection/inspection.module'
import { BackendModule } from './utils/backend/backend.module'
import { SolidDisplayModule } from './features/stream/solid-display/solid-display.module'
import { OverlayModule } from './features/stream/overlay/overlay.module'
import { CameraModule } from './features/stream/camera/camera.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      subscription: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      graphiql: true,
      resolvers: { URL: URLResolver }
    }),
    BackendModule,
    AllianceSelectionModule,
    ScheduleModule.forRoot(),
    FieldControlModule,
    AwardModule,
    InspectionModule,
    TimeoutModule,
    CompetitionModule,
    TeamModule,
    DisplayModule,
    SettingsModule,
    CameraModule,
    StageModule,
    ResultsModule,
    OverlayModule,
    SolidDisplayModule,
    MatchModule,
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'sqlite',
        database: 'database.sqlite',
        synchronize: true,
        logging: false,
        entities: ['dist/**/*.entity.js']
      })
    })
  ],
  providers: [BeaconService]
})

export class AppModule {}
