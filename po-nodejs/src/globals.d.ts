import { Context } from 'apollo-server-core';
import { UserRole } from '@/common/helpers/enums';

declare global {
  export type JwtPayload = {
    id: number;
    loginName: string;
    role: UserRole | null;
    createdAt: Date;
  };

  export type ContextType = Context<{
    user: JwtPayload | null;
  }>;

  type ResponseError = {
    success: false;
    statusCode?: number;
    message: string;
  };

  export type Response<T extends Record<string, any> = {}> =
    | ({
        success: true;
      } & T)
    | ResponseError;

  export type PagedResponse<T = any> =
    | {
        success: true;
        rows: Array<T>;
        total: number;
      }
    | ResponseError;

  export type Dictionary<T> = Record<string, T>;

  // express-jwt
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends JwtPayload {}
  }
}

// 注意: 修改"全局声明"必须在模块内部, 所以至少要有 export{}字样
// 不然会报错❌: 全局范围的扩大仅可直接嵌套在外部模块中或环境模块声明中
export {};
