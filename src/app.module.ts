import { ConfigModule } from '@nestjs/config'
import { Module } from '@nestjs/common'
import { PigeonModule, Transport } from '@alecmmiller/pigeon-mqtt-nest'
import { ScheduleModule } from '@nestjs/schedule'
import { BeaconService, TmModule } from './utils'
import { GraphQLModule } from '@nestjs/graphql'
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius'
import { join } from 'path'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FieldControlModule } from './features/field-control/field-control.module'
import { TeamModule } from './features/team/team.module'
import { SettingsModule } from './utils/settings/settings.module'
import { URLResolver } from 'graphql-scalars'
import { MatchModule } from './features/competition/match'
import { StageModule } from './features/stage/stage.module'
import { ResultsModule } from './features/results/results.module'
import { CompetitionModule } from './features'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      graphiql: true,
      resolvers: { URL: URLResolver }
    }),
    FieldControlModule,
    CompetitionModule,
    TeamModule,
    SettingsModule,
    StageModule,
    TmModule,
    MatchModule,
    ResultsModule,
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'sqlite',
        database: 'database.sqlite',
        synchronize: true,
        logging: false,
        entities: ['dist/**/*.entity.js']
      })
    })
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
