import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  

// Create a single supabase client for interacting with your database
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
