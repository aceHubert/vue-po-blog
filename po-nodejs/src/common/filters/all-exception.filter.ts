import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { GqlContextType } from '@nestjs/graphql';
import { I18nService } from 'nestjs-i18n';
import { Request, Response } from 'express';
import { UnauthorizedError } from 'express-jwt';
import { JsonWebTokenError } from 'jsonwebtoken';
import { BaseError as SequelizeBaseError, DatabaseError as SequelizeDatabaseError } from 'sequelize';
import { ApolloError, toApolloError } from 'apollo-server-errors';
import {
  SyntaxError,
  UserInputError,
  AuthenticationError,
  ForbiddenError,
  ValidationError,
} from '../utils/errors.util';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18nService: I18nService) {}

  async catch(exception: Error, host: ArgumentsHost) {
    const type = host.getType<GqlContextType>();
    if (type === 'http') {
      const http = host.switchToHttp();

      const request = http.getRequest<Request & { i18nLang?: string }>();
      const response = http.getResponse<Response>();
      const status = this.getHttpCodeFromError(exception);
      const description = await this.getHttpDescriptionFromError(exception, request.i18nLang);

      // @ts-ignore
      if (exception instanceof SequelizeDatabaseError && exception.original.code === 'ER_NO_SUCH_TABLE') {
        // 当出现表不存在错误时，提示要初始化数据库， 并设置 response.dbInitRequired = true
        description.message = await this.i18nService.tv('core.error.no_such_table', 'No such table!', {
          lang: request.i18nLang,
        });
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
        if (exception instanceof SequelizeDatabaseError && exception.original.code === 'ER_NO_SUCH_TABLE') {
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
    return exception instanceof SyntaxError || // 代码内主动抛出的 SyntaxError 转换成 http 400
      exception instanceof UserInputError // 代码内主动抛出的 UserInputError 转换成 http 400
      ? HttpStatus.BAD_REQUEST
      : exception instanceof AuthenticationError || // 代码内主动抛出的 AuthenticationError 转换成 http 401
        exception instanceof UnauthorizedError // 将 express-jwt UnauthorizedError 转换成 http 401
      ? HttpStatus.UNAUTHORIZED
      : exception instanceof ForbiddenError // 代码内主动抛出的 ForbiddenError 转换成 http 403
      ? HttpStatus.FORBIDDEN
      : exception instanceof ValidationError // 代码内主动抛出的 ValidationError 转换成 http 405
      ? HttpStatus.METHOD_NOT_ALLOWED
      : exception instanceof HttpException // 如果是 Http 错误，直接获取 status code
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR; // 否则返回 500
  }

  /**
   * 从 Error 获取 graphql 的 extensions.code
   * @param exception Error
   */
  private getGraphqlCodeFromError(exception: Error) {
    return exception instanceof HttpException
      ? getFromHttpStatus(exception.getStatus())
      : exception instanceof SyntaxError // 代码内主动抛出的 SyntaxError 转换成 GRAPHQL_PARSE_FAILED
      ? 'GRAPHQL_PARSE_FAILED'
      : exception instanceof ValidationError // 代码内主动抛出的 ValidationError 转换成 GRAPHQL_VALIDATION_FAILED
      ? 'GRAPHQL_VALIDATION_FAILED'
      : exception instanceof UserInputError // 代码内主动抛出的 UserInputError 转换成 BAD_USER_INPUT
      ? 'BAD_USER_INPUT'
      : exception instanceof AuthenticationError || // 代码内主动抛出的 AuthenticationError 转换成 UNAUTHENTICATED
        exception instanceof UnauthorizedError // 将 express-jwt UnauthorizedError 转换成 UNAUTHENTICATED
      ? 'UNAUTHENTICATED'
      : exception instanceof ForbiddenError // 代码内主动抛出的 ForbiddenError 转换成 FORBIDDEN
      ? 'FORBIDDEN'
      : exception instanceof SequelizeDatabaseError // 将 database error 转换成 DATABASE_ERROR
      ? 'DATABASE_ERROR'
      : 'INTERNAL_SERVER_ERROR'; // 否则返回INTERNAL_SERVER_ERROR

    function getFromHttpStatus(status: number) {
      switch (status) {
        case 401:
          return 'UNAUTHENTICATED';
        case 403:
          return 'FORBIDDEN';
        default:
          return 'INTERNAL_SERVER_ERROR';
      }
    }
  }

  /**
   * 获取 http 的 response 对象
   * @param exception Error
   */
  private async getHttpDescriptionFromError(exception: Error, lang?: string): Promise<Dictionary<any>> {
    const description =
      exception instanceof UnauthorizedError // express-jwt UnauthorizedError
        ? exception.inner instanceof JsonWebTokenError // jwt verify error
          ? await this.i18nService.tv('core.error.invalid_token', 'Invalid token!', { lang })
          : exception.message
        : exception instanceof HttpException
        ? exception.getResponse()
        : exception instanceof SequelizeBaseError
        ? ((exception as any).original || exception).message // 部分 sequelize error 格式化 error 到original
        : exception.message;

    return typeof description === 'string' ? { message: description } : description;
  }
}
