import * as path from 'path';
import { Inject, Injectable } from '@nestjs/common';
import { I18nParseFactory } from '@/common/utils/i18n-parse-factory';
import { LOCALE_MODULE_OPTIONS } from './constants';

// Types
import { LocaleModuleOptions } from './interfaces/locale-module-options.interface';
import { I18nTranslation } from 'nestjs-i18n';

@Injectable()
export class LocaleService {
  // private readonly logger = new Logger('LocaleService');

  constructor(@Inject(LOCALE_MODULE_OPTIONS) private readonly options: Required<LocaleModuleOptions>) {}

  /**
   * site 是否在配置中存在
   */
  hasSiteExists(site: string) {
    return this.options.sites.includes(site);
  }

  /**
   * 获取翻译
   * 当 site 不存在时，直接返回 null
   * @param site 站点
   * @param locale 语言 code
   */
  async getTranslations(
    site: string,
    locale?: string,
  ): Promise<I18nTranslation | { languages: string[]; translations: I18nTranslation } | null> {
    if (!this.hasSiteExists(site)) {
      return null;
    }
    const parseFactory = new I18nParseFactory({
      path: path.join(this.options.path, site),
      filePattern: this.options.filePattern,
      parseFactory: this.options.parseFactory,
    });

    const languages = await parseFactory.parseLanguages();
    if (locale) {
      if (languages.includes(locale)) {
        return (await parseFactory.parseTranslations())[locale];
      } else {
        return {};
      }
    } else {
      return {
        languages,
        translations: await parseFactory.parseTranslations(),
      };
    }
  }
}
