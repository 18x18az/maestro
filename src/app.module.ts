import { ConfigModule } from '@nestjs/config'
import { AllianceSelectionModule, CompetitionModule, DisplayModule, ResultsModule, StreamModule } from '@/features'
import { Module } from '@nestjs/common'
import { PigeonModule, Transport } from '@alecmmiller/pigeon-mqtt-nest'
import { ScheduleModule } from '@nestjs/schedule'
import { BeaconService } from './utils'
import { SkillsModule } from './features/skills/skills.module'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { GraphQLModule } from '@nestjs/graphql'
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius'
import { join } from 'path'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AllianceSelectionModule,
    DisplayModule,
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      graphiql: true
    }),
    StreamModule,
    CompetitionModule,
    MikroOrmModule.forRoot(
      {
        dbName: 'new.db',
        type: 'sqlite',
        autoLoadEntities: true
      }
    ),
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
