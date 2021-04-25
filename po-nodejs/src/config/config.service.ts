import * as fs from 'fs';
import * as path from 'path';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { CONFIG_OPTIONS, getDefaultConfig } from './constants';
import { ConfigModuleOptions, Config } from './interfaces';

@Injectable()
export class ConfigService {
  private readonly logger = new Logger('ConfigService');
  private readonly config: Config;

  constructor(@Inject(CONFIG_OPTIONS) options: ConfigModuleOptions) {
    const ext = path.extname(options.file);
    const basename = path.basename(options.file, ext);
    const envFileName = `${basename}.${process.env.NODE_ENV || 'development'}${ext}`;

    let filePath;

    // po-config.[env].json / po-config.json
    [envFileName, options.file].some((fileName) => {
      try {
        const file = path.resolve(process.cwd(), fileName);
        fs.accessSync(file, fs.constants.R_OK);
        filePath = file;
        return true;
      } catch (err) {
        this.logger.warn(`Error to read config files from ${envFileName}, ${err.message}`);
        return false;
      }
    });

    const config = filePath ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : {};

    this.config = Object.assign({}, getDefaultConfig(), config.backend);
  }

  get<K extends keyof Config>(key: K): Config[K] {
    return this.config[key];
  }
}
