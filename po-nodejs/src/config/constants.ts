/* eslint-disable @typescript-eslint/camelcase */
import { Config } from './interfaces';

export const CONFIG_OPTIONS = 'CONFIG_OPTIONS';

export function getDefaultConfig(): Config {
  return {
    DB_NAME: '',
    DB_USER: '',
    DB_PASSWORD: '',
    DB_HOST: '127.0.0.1',
    DB_PORT: undefined,
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
  };
}
