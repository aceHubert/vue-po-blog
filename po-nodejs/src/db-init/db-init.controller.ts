import { Controller, Get, Post, Body, Scope } from '@nestjs/common';
import { I18n, I18nContext } from 'nestjs-i18n';
import { DbInitService } from './db-init.service';

// Types
import { InitArgs } from './dto/init-args.dto';

@Controller({ path: 'api/db-init', scope: Scope.REQUEST })
export class DbInitController {
  constructor(private readonly dbInitService: DbInitService) {}

  @Get('check')
  async check(): Promise<Response<{ dbInitRequired: boolean }>> {
    const result = await this.dbInitService.haveTables();
    return {
      success: true,
      dbInitRequired: !result,
    };
  }

  @Post('start')
  async start(@Body() initArgs: InitArgs, @I18n() i18n: I18nContext): Promise<Response<{ message: string }>> {
    const result = await this.dbInitService.initDb();

    if (result) {
      // true 第一次建表, 初始化数据
      const success = await this.dbInitService.initDatas(initArgs);
      return {
        success,
        message: await i18n.t(!success ? 'db-init.init_data.faild' : 'db-init.init_data.success'),
      };
    } else {
      // 已经存在表结构，直接返回成功
      return {
        success: true,
        message: await i18n.t('db-init.init_database.success'),
      };
    }
  }
}
