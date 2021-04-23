/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core';
import jwt, { secretType } from 'express-jwt';
import { Request } from 'express';
// import { createExceptionFactory } from '@/common/helpers/i18n-validation-exception-factory';
import { getToken } from '@/common/utils/get-token.utils';
import { AuthService } from '@/auth/auth.service';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const authService = app.get(AuthService);

  // 启动跨域
  app.enableCors();

  app.use(
    // express-jwt middleware
    jwt({
      secret(req: Request, payload: JwtPayload, done: (err: any, secret?: secretType) => void) {
        authService
          .getScrect(payload.id, payload.device)
          .then((secret) => done(null, secret))
          .catch(done);
      },
      algorithms: [authService.JwtAlgorithm],
      credentialsRequired: false,
      getToken,
    }).unless({
      path: [/^\/api\/auth\/(login|refresh)/],
    }),
  );

  await app.listen(5010);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
