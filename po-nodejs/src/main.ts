/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core';
import jwt, { secretType } from 'express-jwt';
import { Request } from 'express';
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

  app.use(
    // express-jwt middleware
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
      path: [/^\/api\/auth\/(signin|refresh)/],
    }),
  );

  await app.listen(configService.get('server_port'));
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
