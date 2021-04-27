import { ModuleMetadata, Type } from '@nestjs/common';
import { ConfigOptions, ConfigFromPathOptions } from './config-options.interface';

export type ConfigModuleOptions = ConfigFromPathOptions | (Partial<ConfigOptions> & { path?: never });

export interface ConfigModuleOptionsFactory {
  createConfigOptions(): Promise<ConfigModuleOptions> | ConfigModuleOptions;
}

export interface ConfigModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<ConfigModuleOptionsFactory>;
  useClass?: Type<ConfigModuleOptionsFactory>;
  useFactory: (...args: any[]) => Promise<ConfigModuleOptions> | ConfigModuleOptions;
  inject?: any[];
}
