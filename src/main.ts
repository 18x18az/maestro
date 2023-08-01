import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import helmet from 'helmet'
import { ValidationPipe } from '@nestjs/common'
import { MicroserviceOptions } from '@nestjs/microservices'
import MqttTransport from './utils/transport/mqttServer'

async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  app.setGlobalPrefix('api')
  app.connectMicroservice<MicroserviceOptions>({
    strategy: new MqttTransport()
  })
  await app.startAllMicroservices()
  app.useGlobalPipes(new ValidationPipe())
  app.use(helmet({ crossOriginEmbedderPolicy: false, crossOriginResourcePolicy: false }))
  await app.listen(80)
}

void bootstrap()
