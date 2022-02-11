import { Controller, Scope, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { BaseController } from '@/common/controllers/base.controller';
import { LocaleService } from './locale.service';

@ApiTags('site')
@Controller({ path: 'api/locale', scope: Scope.REQUEST })
export class LocaleController extends BaseController {
  constructor(private readonly localeService: LocaleService) {
    super();
  }

  @Get(':site/translations')
  @ApiOperation({ description: 'Get site translation config.' })
  // @ApiQuery({
  //   name: 'locale',
  //   required: false,
  //   description: "Locale string. If set, then return then specific's locale translation config",
  // })
  @ApiResponse({
    status: 200,
    description: 'Translation config(s).',
  })
  async getTranslations(
    @Param('site') site: string,
    @Query('locale') locale: string | undefined,
    @I18n() i18n: I18nContext,
  ) {
    const translations = locale
      ? await this.localeService.getTranslations(site, locale)
      : await this.localeService.getTranslations(site);
    if (translations) {
      return this.success({ locale: translations });
    } else {
      return this.faild(await i18n.tv('core.locale.translation.site_not_exists', 'Site dose not exists!'));
    }
  }
}
