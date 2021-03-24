/**
 * Global ErrorInterceptor Middleware
 * 当 database 没有初始化时，返回500错误并且dbInitRequired=true
 * 其它 db 执行错误将消息格式化后返回
 */
import { DatabaseError } from 'sequelize';
import { RuntimeError } from '@/common/utils/errors.utils';

// Types
import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';

export const graphqlErrorInterceptorMiddleware: FieldMiddleware = async (ctx: MiddlewareContext, next: NextFn) => {
  try {
    await next();
  } catch (err) {
    // db errors
    if (err instanceof DatabaseError) {
      // @ts-ignore
      const code = err.original.code;
      // 将db error 转换成 runtime error, 屏蔽 sql 执行错误信息返回前端
      if (code === 'ER_NO_SUCH_TABLE') {
        throw new RuntimeError('No such table!', { dbInitRequired: true });
      } else {
        throw new RuntimeError(`Sql execute failed, errorCode: ${code}!`);
      }
    }

    throw err;
  }
};
