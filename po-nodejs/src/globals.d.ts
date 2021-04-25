import { Context } from 'apollo-server-core';
import { UserRole } from '@/users/enums';

declare global {
  export type JwtPayload = {
    id: number;
    loginName: string;
    role: UserRole | null;
    device: string;
    createdAt: Date;
  };

  export type JwtPayloadWithLang = JwtPayload & {
    lang?: string;
  };

  export type GqlContext = Context<{
    user: JwtPayload | null;
  }>;

  type ResponseError = {
    success: false;
    statusCode?: number;
    message: string;
  };

  export type ResponseSuccess<T extends Record<string, any> = {}> = {
    success: true;
  } & T;

  export type PagedResponseSuccess<T = any> = ResponseSuccess<{
    rows: Array<T>;
    total: number;
  }>;

  export type Response<T extends Record<string, any> = {}> = ResponseSuccess<T> | ResponseError;
  export type PagedResponse<T extends Record<string, any> = {}> = PagedResponseSuccess<T> | ResponseError;

  export type Dictionary<T> = Record<string, T>;

  // express-jwt
  namespace Express {
    interface User extends JwtPayload {}
  }
}

// 注意: 修改"全局声明"必须在模块内部, 所以至少要有 export{}字样
// 不然会报错❌: 全局范围的扩大仅可直接嵌套在外部模块中或环境模块声明中
export {};
