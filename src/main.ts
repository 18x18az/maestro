import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import helmet from 'helmet'
import { ValidationPipe } from '@nestjs/common'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'

async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  app.setGlobalPrefix('api')
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      url: 'ws://localhost:1883'
    }
  })
  await app.startAllMicroservices()
  app.useGlobalPipes(new ValidationPipe())
  app.use(helmet({ crossOriginEmbedderPolicy: false, crossOriginResourcePolicy: false }))
  await app.listen(80)
}

void bootstrap()
