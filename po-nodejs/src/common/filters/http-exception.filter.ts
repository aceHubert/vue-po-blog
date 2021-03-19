import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { DatabaseError } from 'sequelize';
import { AuthenticationError, ForbiddenError, ValidationError, UserInputError } from '../utils/errors.utils';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // 将db 错误转换成指定错误（过滤 sql 执行错误信息返回前端）
    if (exception instanceof DatabaseError) {
      // @ts-ignore
      const code = exception.original.code;
      const status = HttpStatus.INTERNAL_SERVER_ERROR;
      // 需要初始化数据库
      if (code === 'ER_NO_SUCH_TABLE') {
        response.status(status).json({
          message: 'No such table!',
          statusCode: status,
          dbInitRequired: true,
        });
      } else {
        response.status(status).json({
          message: `Sql execute failed, errorCode: ${code}!`,
          statusCode: status,
        });
      }
    } else {
      const status =
        exception instanceof UserInputError // 将 AuthenticationError 转换成 http 400
          ? HttpStatus.BAD_REQUEST
          : exception instanceof AuthenticationError // 将 AuthenticationError 转换成 http 401
          ? HttpStatus.UNAUTHORIZED
          : exception instanceof ForbiddenError // 将 ForbiddenError 转换成 http 403
          ? HttpStatus.FORBIDDEN
          : exception instanceof ValidationError // 将 ValidationError 转换成 http 405
          ? HttpStatus.METHOD_NOT_ALLOWED
          : exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;

      const description = exception instanceof HttpException ? exception.getResponse() : exception.message;
      response.status(status).json(
        Object.assign(typeof description === 'string' ? { message: description } : description, {
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
        }),
      );
    }
  }
}
