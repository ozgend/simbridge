import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { access, mkdirSync } from 'fs';
import { AppModule } from './app.module';

declare const module: any;
const logDir = 'resources/logs/local-server';
const coRouteDir = 'resources/coroutes';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });

    // Pino
    app.useLogger(app.get(Logger));

    // Validation
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    // Folder creation
    access(logDir, (error) => {
        if (error) mkdirSync(logDir, { recursive: true });
    });
    access(coRouteDir, (error) => {
        if (error) mkdirSync(coRouteDir, { recursive: true });
    });

    // Swagger
    const swaggerConfig = new DocumentBuilder()
        .setTitle('FlyByWire Simulations Local API')
        .setDescription('The FlyByWire Simulations Local API Description')
        .setVersion('1.0')
        .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('local-api', app, swaggerDocument);

    await app.listen(3838);

    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }
}
bootstrap();