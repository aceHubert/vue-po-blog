import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * 从 http header 或 query 中获取token
 */
export const User = createParamDecorator((field: keyof JwtPayload, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const user = request.user;
  return field ? user && user[field] : user;
});
