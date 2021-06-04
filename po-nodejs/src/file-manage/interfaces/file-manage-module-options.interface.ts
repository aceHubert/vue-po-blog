import { ModuleMetadata, Type } from '@nestjs/common';

export interface FileManageModuleOptions {
  /** 文件存储目录, 如果目录不在在，会尝试新建, 默认：[process.cwd()]/uploads */
  dest?: string;
  /** 文件分组，默认： month */
  groupBy?: 'month' | 'year';
  /** 相对于静态资源服务的前缀，默认: uploads */
  staticPrefix?: string;
}

export interface FileManageModuleOptionsFactory {
  createFileManageOptions(): Promise<FileManageModuleOptions> | FileManageModuleOptions;
}

export interface FileManageModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<FileManageModuleOptionsFactory>;
  useClass?: Type<FileManageModuleOptionsFactory>;
  useFactory: (...args: any[]) => Promise<FileManageModuleOptions> | FileManageModuleOptions;
  inject?: any[];
}
