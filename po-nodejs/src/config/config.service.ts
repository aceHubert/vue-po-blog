import warning from 'warning';
import * as fs from 'fs';
import * as path from 'path';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS, getDefaultConfig } from './constants';
import { ConfigModuleOptions, Config } from './interfaces';

@Injectable()
export class ConfigService {
  private readonly config: Config;

  constructor(@Inject(CONFIG_OPTIONS) options: ConfigModuleOptions) {
    const ext = path.extname(options.file);
    const basename = path.basename(options.file, ext);
    const envFileName = `${basename}.${process.env.NODE_ENV || 'development'}${ext}`;

    let filePath;
    try {
      // po-config.[env].json
      const envFile = path.resolve(process.cwd(), envFileName);
      fs.accessSync(envFile, fs.constants.R_OK);
      filePath = envFile;
    } catch (err) {
      warning(
        process.env.NODE_ENV === 'production',
        `Error to read config files from ${envFileName}, Error:${err.message}`,
      );
    }

    if (!filePath) {
      try {
        // po-config.json
        const file = path.resolve(process.cwd(), options.file);
        fs.accessSync(file, fs.constants.R_OK);
        filePath = file;
      } catch (err) {
        warning(
          process.env.NODE_ENV === 'production',
          `Error to read config files from ${options.file}, Error:${err.message}`,
        );
      }
    }
    const config = filePath ? JSON.parse(fs.readFileSync(filePath).toString()) : {};

    this.config = Object.assign({}, getDefaultConfig(), config.backend);
  }

  get<K extends keyof Config>(key: K): Config[K] {
    return this.config[key];
  }
}
