import { HttpAdapterHost } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Request, Scope } from '@nestjs/common';
import { I18n, I18nContext } from 'nestjs-i18n';
import { BaseController } from '@/common/controllers/base.controller';
import { DbInitService } from './db-init.service';

// Types
// import express, { Express } from 'express';
import { InitArgsDto } from './dto/init-args.dto';

@ApiTags('init')
@Controller({ path: 'api/db-init', scope: Scope.REQUEST })
export class DbInitController extends BaseController {
  private readonly logger = new Logger('DbInitController');

  constructor(private readonly httpAdapterHost: HttpAdapterHost, private readonly dbInitService: DbInitService) {
    super();
  }

  @Get('check')
  async check(): Promise<Response<{ dbInitRequired: boolean }>> {
    const result = await this.dbInitService.hasDbInitialized();
    return this.success({
      dbInitRequired: !result,
    });
  }

  @Post('start')
  async start(
    @Request() request: any,
    @Body() initArgs: InitArgsDto,
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
      } else {
        // else if (platformName === 'fastify') {
        this.logger.warn(`server platform "${platformName}" is not support!`);
      }
      const success = await this.dbInitService.initDatas({
        ...initArgs,
        siteUrl,
      });
      return success
        ? this.success({
            message: await i18n.tv('core.db-init.controller.init_data.success', 'Initialize datas successful!'),
          })
        : this.faild(
            await i18n.tv('core.db-init.controller.init_data.faild', 'An error occurred while initializing datas!'),
          );
    } else {
      // 已经存在表结构，直接返回成功
      return this.success({
        message: await i18n.tv('core.db-init.controller.init_database.success', 'Initialize database successful!'),
      });
    }
  }
}
