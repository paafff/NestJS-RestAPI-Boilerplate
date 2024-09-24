import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { InitializationService } from './services/initialization/initialization.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const environment = process.env.NODE_ENV;
  const port = process.env.APP_PORT;

  // Set CORS options
  // const corsOptions: CorsOptions = {
  //   origin: 'http://your-frontend-domain.com', // Ganti dengan domain frontend Anda
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //   credentials: true,
  // };
  // app.enableCors(corsOptions);
  app.enableCors({
    origin: '*', // You can specify the allowed origins here (e.g., 'http://example.com')
    methods: 'GET,PUT,PATCH,POST,DELETE',
    allowedHeaders:
      'Origin, X-Requested-With, Content-Type, Accept, Content-Disposition', // Add Content-Disposition
    credentials: true, // If using cookies or authorization headers
  });

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API description')
    .setVersion('1.0')
    .addTag('auth')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const initializationService = app.get(InitializationService);
  try {
    await initializationService.initialize();
  } catch (error) {
    console.error('Initialization failed:', error);
  }

  await app.listen(port || 3000);
  console.log(`backend is running in ${environment} mode on port ${port}`);
}
bootstrap();
