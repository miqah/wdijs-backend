import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for all origins
  app.enableCors();

    // Increase JSON body size limit (10MB)
  app.use(bodyParser.json({ limit: '10mb' }));
  
  // Increase URL-encoded body size limit (10MB)
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  console.log('Starting on port', process.env.PORT ?? 3000);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
