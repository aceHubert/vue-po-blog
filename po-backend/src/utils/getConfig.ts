/* eslint-disable @typescript-eslint/camelcase */
import path from 'path';
import fs from 'fs';
import { error as globalError } from '@vue-async/utils';

class ReadConfigs {
  protected configs: Config | null = null;
  protected configPath: string = '';

  constructor(configPath: string) {
    this.configPath = configPath;
  }

  protected initialize() {
    const configFromFile: Partial<{ backend: Config }> = (() => {
      try {
        fs.accessSync(this.configPath, fs.constants.R_OK);
        return require(this.configPath);
      } catch (err) {
        globalError(
          process.env.NODE_ENV === 'production',
          `Error to read config files from ${this.configPath}, Error:${err.message}`,
        );
      }
      return {};
    })();

    this.configs = Object.freeze(
      Object.assign(
        {},
        {
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
        },
        configFromFile.backend,
      ),
    );
  }

  get<K extends keyof Config>(key: K): Config[K] {
    // 第一次读取时初始化
    if (this.configs === null) {
      this.initialize();
    }

    return this.configs![key];
  }
}

export const configs = new ReadConfigs(path.resolve(process.cwd(), 'po-config.json')); // 从执行目录（根目录读取）
