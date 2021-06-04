import { ModuleMetadata, Type } from '@nestjs/common';
import { I18nTranslation } from 'nestjs-i18n';

export interface LocaleModuleOptions {
  /** 语言文件目录 */
  path: string;
  /** 注册站点，将会从 [path]/site/ 目录下查找所有语言配置 */
  sites: string[];
  /** 文件类型，默认：*.json */
  filePattern?: string;
  /** 文件内容转换方法 */
  parseFactory?: (source: string) => I18nTranslation;
}

export interface LocaleModuleOptionsFactory {
  createLocaleOptions(): Promise<LocaleModuleOptions> | LocaleModuleOptions;
}

export interface LocaleModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<LocaleModuleOptionsFactory>;
  useClass?: Type<LocaleModuleOptionsFactory>;
  useFactory: (...args: any[]) => Promise<LocaleModuleOptions> | LocaleModuleOptions;
  inject?: any[];
}
