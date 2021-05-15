import { HttpAdapterHost } from '@nestjs/core';
import { Controller, Get, Post, Body, Request, Scope } from '@nestjs/common';
import { I18n, I18nContext } from 'nestjs-i18n';
import { BaseController } from '@/common/controllers/base.controller';
import { DbInitService } from './db-init.service';

// Types
// import express, { Express } from 'express';
import { InitArgs } from './dto/init-args.dto';

@Controller({ path: 'api/db-init', scope: Scope.REQUEST })
export class DbInitController extends BaseController {
  constructor(private readonly httpAdapterHost: HttpAdapterHost, private readonly dbInitService: DbInitService) {
    super();
  }

  @Get('check')
  async check(): Promise<Response<{ dbInitRequired: boolean }>> {
    const result = await this.dbInitService.haveTables();
    return this.success({
      dbInitRequired: !result,
    });
  }

  @Post('start')
  async start(
    @Request() request: any,
    @Body() initArgs: InitArgs,
    @I18n() i18n: I18nContext,
  ): Promise<Response<{ message: string }>> {
    const result = await this.dbInitService.initDb();

    // true 第一次建表, 初始化数据
    if (result) {
      const httpAdapter = this.httpAdapterHost.httpAdapter;
      const platformName = httpAdapter.getType();

      let siteUrl = '';
      if (platformName === 'express') {
        siteUrl = `${request.protocol}://${request.get('host')}`;
      }
      // todo:暂时不使用
      // else if (platformName === 'fastify') {
      //
      // }
      const success = await this.dbInitService.initDatas({
        ...initArgs,
        siteUrl,
      });
      return success
        ? this.success({
            message: await i18n.t('db-init.init_data.success'),
          })
        : this.faild(await i18n.t('db-init.init_data.faild'));
    } else {
      // 已经存在表结构，直接返回成功
      return this.success({
        message: await i18n.t('db-init.init_database.success'),
      });
    }
  }
}
