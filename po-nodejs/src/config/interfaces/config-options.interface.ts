import { ModuleMetadata } from '@nestjs/common';

export interface ConfigModuleOptions {
  file: string;
}

export interface ConfigModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => Promise<ConfigModuleOptions> | ConfigModuleOptions;
  inject?: any[];
}
