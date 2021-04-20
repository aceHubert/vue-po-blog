/* eslint-disable no-console */
import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import jwt, { secretType } from 'express-jwt';
import { Request } from 'express';
import { AllExceptionFilter } from '@/common/filters/all-exception.filter';
import { AuthorizedGuard } from '@/common/guards/authorized.guard';
import { getToken } from '@/common/utils/get-token.utils';
import { AuthService } from '@/auth/auth.service';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);
  const authService = app.get(AuthService);

  // express-jwt middleware
  app.use(
    jwt({
      secret(req: Request, payload: JwtPayload, done: (err: any, secret?: secretType) => void) {
        console.log(payload.device);
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

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionFilter());
  app.useGlobalGuards(new AuthorizedGuard(reflector));

  await app.listen(5010);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
