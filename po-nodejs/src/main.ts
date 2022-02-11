/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import jwt, { secretType } from 'express-jwt';
import { Request, Response } from 'express';
import { getToken } from '@/common/utils/get-token.util';
import { ConfigService } from '@/config/config.service';
import { AuthService } from '@/auth/auth.service';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const authService = app.get(AuthService);

  // 启动跨域
  app.enableCors();

  // 启动 root 页面
  app.getHttpAdapter().get('/', (req: Request, res: Response) => {
    res.send('hello world!');
  });

  // express-jwt middleware
  app.use(
    jwt({
      secret(req: Request, payload: Express.User, done: (err: any, secret?: secretType) => void) {
        authService
          .getScrect(payload.id, payload.device)
          .then((secret) => done(null, secret))
          .catch(done);
      },
      algorithms: [authService.JwtAlgorithm],
      credentialsRequired: false,
      getToken,
    }).unless({
      path: [/^\/api\/auth\/(signin|refresh)/, /^\/api\/locale\//],
    }),
  );

  // swagger
  const api = new DocumentBuilder()
    .setTitle('APIs')
    .setDescription('The API description')
    .setVersion('1.0')
    .addTag('init', 'Website initialization.')
    .addTag('auth', 'User authorization.')
    .addTag('file', 'File management.')
    .addTag('site', 'Site config.')
    .build();
  const document = SwaggerModule.createDocument(app, api);
  SwaggerModule.setup('api', app, document);

  await app.listen(configService.get('server_port'), configService.get('server_host'));
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
