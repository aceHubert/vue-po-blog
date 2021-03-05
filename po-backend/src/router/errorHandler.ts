// Types
import { DatabaseError } from 'sequelize';
import { ErrorRequestHandler } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = function (err, req, res, next) {
  if (err instanceof DatabaseError) {
    // @ts-ignore
    const code = err.original.code;
    // 将db error 转换成 runtime error, 屏蔽 sql 执行错误信息返回前端
    if (code === 'ER_NO_SUCH_TABLE') {
      res.status(500).json({
        success: false,
        message: 'no such table!',
        initRequired: true,
      });
    }
  }
  res.status(500).json({
    success: false,
    message: err.message,
  });
};
