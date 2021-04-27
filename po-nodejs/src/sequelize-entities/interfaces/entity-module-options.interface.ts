import { ModuleMetadata, Type } from '@nestjs/common';
import { Dialect } from 'sequelize';

export interface EntityModuleOptions {
  host: string;
  port: number;
  dialect?: Dialect;
  charset?: string;
  collate?: string;
  database: string;
  username: string;
  password: string;
  tablePrefix?: string;
}

export interface EntityOptionsFactory {
  createEntityOptions(): Promise<EntityModuleOptions> | EntityModuleOptions;
}

export interface EntityModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<EntityOptionsFactory>;
  useClass?: Type<EntityOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<EntityModuleOptions> | EntityModuleOptions;
  inject?: any[];
}
