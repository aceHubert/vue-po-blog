import { Controller, Scope, Get, Param, Query } from '@nestjs/common';
import { I18n, I18nContext } from 'nestjs-i18n';
import { BaseController } from '@/common/controllers/base.controller';
import { LocaleService } from './locale.service';

@Controller({ path: 'api/locale', scope: Scope.REQUEST })
export class LocaleController extends BaseController {
  constructor(private readonly localeService: LocaleService) {
    super();
  }

  @Get(':site/translations')
  async getTranslations(
    @Param('site') site: string,
    @Query('locale') locale: string | undefined,
    @I18n() i18n: I18nContext,
  ) {
    const translations = await this.localeService.getTranslations(site, locale);
    if (translations) {
      return this.success({ locale: translations });
    } else {
      return this.faild(await i18n.tv('core.locale.translation.site_not_exists', 'Site dose not exists!'));
    }
  }
}
