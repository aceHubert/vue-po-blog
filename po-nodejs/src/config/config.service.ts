import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from './constants';

// Types
import { ConfigOptions } from './interfaces/config-options.interface';

@Injectable()
export class ConfigService {
  // private readonly logger = new Logger('ConfigService');

  constructor(@Inject(CONFIG_OPTIONS) private readonly options: ConfigOptions) {}

  get<K extends keyof ConfigOptions>(key: K): ConfigOptions[K] {
    return this.options[key];
  }
}
