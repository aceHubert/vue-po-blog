import { Controller, Get, Post, Body, Scope } from '@nestjs/common';
import { DbInitDataSource } from '@/sequelize-datasources/datasources';

// Types
import { InitArgs } from '@/sequelize-datasources/interfaces';

@Controller({ path: 'api/db-init', scope: Scope.REQUEST })
export class DbInitController {
  constructor(private readonly dbInitDataSource: DbInitDataSource) {}

  @Get('check')
  async check(): Promise<Response<{ dbInitRequired: boolean }>> {
    const result = await this.dbInitDataSource.haveTables();
    return {
      success: true,
      dbInitRequired: !result,
    };
  }

  @Post('start')
  async start(@Body() initArgs: InitArgs): Promise<Response<{ message: string }>> {
    const result = await this.dbInitDataSource.initDB({
      alter: true,
      // match: /_dev$/,
      when: () => this.dbInitDataSource.haveTables().then((haveTables) => !haveTables),
    });

    // true 第一次建表, 初始化数据
    if (result) {
      const success = await this.dbInitDataSource.initDatas(initArgs);
      return {
        success,
        message: !success ? 'An error occurred during initializing datas!' : 'initialize datas successfully!',
      };
    } else {
      return {
        success: true,
        message: 'initialize database successfully!',
      };
    }
  }
}
