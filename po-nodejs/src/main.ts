/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core';
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

  await app.listen(configService.get('server_port'));
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
