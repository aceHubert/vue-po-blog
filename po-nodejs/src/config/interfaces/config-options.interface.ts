import { Dialect } from 'sequelize';
import { Algorithm } from 'jsonwebtoken';
import { Options as MulterOptions } from 'multer';

export interface ConfigFromPathOptions {
  path: string;
}

export interface ConfigOptions {
  /** server configs */
  server_port: number;
  /** db configs */
  db_name: string;
  db_user: string;
  db_password: string;
  db_host: string;
  db_port: number;
  db_dialect: Dialect;
  db_charset: string;
  db_collate: string;
  table_prefix: string;
  /** jwt configs */
  jwt_screct: string;
  jwt_algorithm: Algorithm;
  jwt_expiresIn: string | number;
  jwt_refresh_token_expiresIn: string | number;
  /** cache configs */
  cache_ttl: number;
  cache_max: number;
  /** file manage config */
  file_storage: 'memory' | 'disk';
  file_dest: string | undefined;
  file_limits: MulterOptions['limits'];
  /** others */
  [key: string]: any;
}
