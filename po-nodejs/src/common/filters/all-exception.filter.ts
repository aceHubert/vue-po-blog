import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlContextType } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { UnauthorizedError } from 'express-jwt';
import { JsonWebTokenError } from 'jsonwebtoken';
import { DatabaseError } from 'sequelize';
import {
  AuthenticationError,
  ForbiddenError,
  ValidationError,
  UserInputError,
  ApolloError,
  toApolloError,
} from '../utils/gql-errors.utils';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const type = host.getType<GqlContextType>();
    if (type === 'http') {
      const http = host.switchToHttp();

      const request = http.getRequest<Request>();
      const response = http.getResponse<Response>();

      const status = this.getHttpCodeFromError(exception);
      const description = this.getHttpDescriptionFromError(exception);

      // @ts-ignore
      if (exception instanceof DatabaseError && exception.original.code === 'ER_NO_SUCH_TABLE') {
        // 当出现表不存在错误时，提示要初始化数据库， 并设置 response.dbInitRequired = true
        description.message = 'No such table!';
        description.dbInitRequired = true;
      }

      response.status(status).json(
        Object.assign({}, description, {
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
        }),
      );
      return;
    } else if (type === 'graphql') {
      // 将非 ApolloError 转换在 ApolloError
      if (!(exception instanceof ApolloError)) {
        // @ts-ignore
        if (exception instanceof DatabaseError && exception.original.code === 'ER_NO_SUCH_TABLE') {
          // 当出现表不存在错误时，提示要初始化数据库, 并设置 extensions.dbInitRequired = true
          (exception as Error & { extensions?: Record<string, any> }).extensions = {
            dbInitRequired: true,
          };
        }
        return toApolloError(exception, this.getGraphqlCodeFromError(exception));
      }
      return exception;
    } else {
      // todo:其它情况
      return;
    }
  }

  /**
   * 从 Error 获取返回的 http code
   * @param exception Error
   */
  private getHttpCodeFromError(exception: Error): number {
    return exception instanceof UserInputError // 将 UserInputError 转换成 http 400
      ? HttpStatus.BAD_REQUEST
      : exception instanceof AuthenticationError || // 将 AuthenticationError 转换成 http 401
        exception instanceof UnauthorizedError // 将 express-jwt UnauthorizedError 转换成 http 401
      ? HttpStatus.UNAUTHORIZED
      : exception instanceof ForbiddenError // 将 ForbiddenError 转换成 http 403
      ? HttpStatus.FORBIDDEN
      : exception instanceof ValidationError // 将 ValidationError 转换成 http 405
      ? HttpStatus.METHOD_NOT_ALLOWED
      : exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR; // 500
  }

  /**
   * 从 Error 获取 graphql 的 extensions.code
   * @param exception Error
   */
  private getGraphqlCodeFromError(exception: Error) {
    return exception instanceof UnauthorizedError || // 将 express-jwt UnauthorizedError 转换成 UNAUTHENTICATED
      exception instanceof UnauthorizedException // UnauthorizedException from guard
      ? 'UNAUTHENTICATED'
      : exception instanceof ForbiddenException // ForbiddenException from guard
      ? 'FORBIDDEN'
      : exception instanceof DatabaseError
      ? 'DATABASE_ERROR' // 将 database error 转换成 DATABASE_ERROR
      : 'INTERNAL_SERVER_ERROR';
  }

  /**
   * 获取 http 的 response 对象
   * @param exception Error
   */
  private getHttpDescriptionFromError(exception: Error): Dictionary<any> {
    const description =
      exception instanceof UnauthorizedError // express-jwt UnauthorizedError
        ? exception.inner instanceof JsonWebTokenError // jwt verify error
          ? 'invalid token!'
          : exception.message
        : exception instanceof HttpException
        ? exception.getResponse()
        : exception.message;

    if (typeof description === 'string') {
      return { message: description };
    } else {
      return description;
    }
  }
}
