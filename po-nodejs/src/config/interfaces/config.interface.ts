import { Dialect } from 'sequelize';
import { Algorithm } from 'jsonwebtoken';

export type Config = {
  DB_NAME?: string;
  DB_USER?: string;
  DB_PASSWORD?: string;
  DB_HOST?: string;
  DB_PORT?: number;
  DB_DIALECT?: Dialect;
  DB_CHARSET?: string;
  DB_COLLATE?: string;
  use_db_variable: false | string;
  table_prefix: string;
  jwt_screct: string;
  jwt_algorithm: Algorithm;
  jwt_expiresIn: string | number;
  jwt_refresh_token_expiresIn: string | number;
  cache_ttl: number;
  /**
   * Cache Max
   */
  cache_max: number;
};
