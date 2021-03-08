/**
 * Global ErrorInterceptor Middleware
 */

import { MiddlewareInterface, ResolverData, NextFn } from 'type-graphql';
import { DatabaseError } from 'sequelize';
import { RuntimeError, ApolloError } from '@/utils/errors';

export class ErrorInterceptor implements MiddlewareInterface<ContextType> {
  constructor() {}

  async use(_: ResolverData<ContextType>, next: NextFn) {
    try {
      return await next();
    } catch (err) {
      // db errors
      if (err instanceof DatabaseError) {
        // @ts-ignore
        const code = err.original.code;
        // 将db error 转换成 runtime error, 屏蔽 sql 执行错误信息返回前端
        if (code === 'ER_NO_SUCH_TABLE') {
          throw new ApolloError('No such table!', 'DB_INIT_ERROR');
        } else {
          throw new RuntimeError(`Sql execute failed, errorCode: ${code}!`);
        }
      }

      throw err;
    }
  }
}
