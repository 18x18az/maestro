import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import fastifyMultipart from '@fastify/multipart'
import compression from '@fastify/compress'

async function bootstrap (): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { logger: ['error', 'warn', 'log'] }
  )
  app.enableCors()
  app.setGlobalPrefix('api')
  await app.register(compression)
  await app.register(fastifyMultipart)
  await app.listen(3002, '0.0.0.0')
}

void bootstrap()
