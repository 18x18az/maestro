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
    AllianceSelectionModule,
    ScheduleModule.forRoot(),
    FieldControlModule,
    CompetitionModule,
    TeamModule,
    DisplayModule,
    SettingsModule,
    StageModule,
    ResultsModule,
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
