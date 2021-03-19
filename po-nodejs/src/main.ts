/* eslint-disable no-console */
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import jwt, { secretType } from 'express-jwt';
import { Request } from 'express';
import { getToken } from '@/common/utils/get-token.utils';
import { AuthService } from '@/auth/auth.service';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const context = await NestFactory.createApplicationContext(AppModule);
  const authService = context.get(AuthService);
  app.use(
    jwt({
      secret(req: Request, payload: JwtPayload, done: (err: any, secret?: secretType) => void) {
        authService
          .getScrect(payload.id)
          .then((secret) => done(null, secret))
          .catch(done);
      },
      algorithms: [authService.JwtAlgorithm],
      credentialsRequired: false,
      ignoreExpiration: true, // 忽略掉过期验证，通过@Authroized()守卫处理
      getToken,
    }),
  );

  await app.listen(5010);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
