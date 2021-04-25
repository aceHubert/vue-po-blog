import { Injectable } from '@nestjs/common';
import { DbInitDataSource } from '@/sequelize-datasources/datasources';

// Types
import { InitArgs } from '@/sequelize-datasources/interfaces';

@Injectable()
export class DbInitService {
  // private readonly logger = new Logger('DbInitService');

  constructor(private readonly dbInitDataSource: DbInitDataSource) {}

  /**
   * 查询数据库是否有表结构
   */
  haveTables(): Promise<boolean> {
    return this.dbInitDataSource.haveTables();
  }

  /**
   * 初始化数据库
   * 如果已存在表结构，直接返回false;
   */
  initDb(): Promise<boolean> {
    return this.dbInitDataSource.initDB({
      alter: true,
      // match: /_dev$/,
      when: () => this.haveTables().then((haveTables) => !haveTables),
    });
  }

  /**
   * 根据参数初始化表数据
   */
  initDatas(initArgs: InitArgs): Promise<boolean> {
    return this.dbInitDataSource.initDatas(initArgs);
  }
}
