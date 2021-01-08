import { Sequelize, Dialect } from 'sequelize';
import { Algorithm } from 'jsonwebtoken';

declare global {
  export type Config = {
    DB_NAME?: string;
    DB_USER?: string;
    DB_PASSWORD?: string;
    DB_HOST?: string;
    DB_DIALECT?: Dialect;
    DB_CHARSET?: string;
    DB_COLLATE?: string;
    use_db_variable: false | string;
    table_prefix: string;
    jwt_screct: string;
    jwt_algorithm: Algorithm;
    jwt_expiresIn: string | number;
  };

  export interface TableInitFn {
    (sequelize: Sequelize, options: TableInitOptions): void;
  }

  export type TableInitOptions = {
    prefix: string;
  };

  export type ContextType = {
    token: string;
    user?: {
      role: string;
    };
  };

  export type JwtPayload = {
    id: number;
    mobile?: string;
    email?: string;
    role: string;
  };

  export type Dictionary<T> = Record<string, T>;
}

// 注意: 修改"全局声明"必须在模块内部, 所以至少要有 export{}字样
// 不然会报错❌: 全局范围的扩大仅可直接嵌套在外部模块中或环境模块声明中
export {};
