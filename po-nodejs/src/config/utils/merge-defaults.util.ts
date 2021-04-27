/* eslint-disable @typescript-eslint/camelcase */
import { ConfigOptions } from '../interfaces';

const defaultOptions: ConfigOptions = {
  server_port: 5010,
  DB_NAME: 'po-blog',
  DB_USER: 'test',
  DB_PASSWORD: 'test',
  DB_HOST: '127.0.0.1',
  DB_PORT: 3306,
  DB_DIALECT: 'mysql',
  DB_CHARSET: 'utf8',
  DB_COLLATE: '',
  use_db_variable: false,
  table_prefix: 'po_',
  jwt_screct: 'e83a8c67-3df0-4feb-8d90-09a354b23b1f',
  jwt_algorithm: 'HS256',
  jwt_expiresIn: '30m',
  jwt_refresh_token_expiresIn: '15d',
  cache_ttl: 5,
  cache_max: 1000,
  file_storage: 'disk',
  file_dest: undefined,
  file_limits: undefined,
};

export function mergeDefaults(
  options: Partial<ConfigOptions>,
  defaults: ConfigOptions = defaultOptions,
): ConfigOptions {
  const moduleOptions = {
    ...defaults,
    ...options,
  };

  return moduleOptions;
}
