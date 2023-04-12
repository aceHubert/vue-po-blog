import path from 'path';
import fs from 'fs';
import { Injectable, Logger } from '@nestjs/common';
import { DbInitDataSource } from '@/sequelize-datasources/datasources';

// Types
import { InitArgs } from '@/sequelize-datasources/interfaces';

const lockDbFile = path.join(process.cwd(), 'db.lock');

@Injectable()
export class DbInitService {
  private readonly logger = new Logger('DbInitService');

  constructor(private readonly dbInitDataSource: DbInitDataSource) {}

  /**
   * 查询数据库是否已经初始化
   */
  hasDbInitialized(): Promise<boolean> {
    return new Promise((resolve) => {
      fs.access(lockDbFile, fs.constants.F_OK, (err) => {
        if (err) resolve(false);

        resolve(true);
      });
    });
  }

  /**
   * 初始化数据库
   * 如果已存在表结构，直接返回false;
   */
  initDb(): Promise<boolean> {
    return this.dbInitDataSource
      .initDB({
        alter: true,
        // match: /_dev$/,
        when: () => this.hasDbInitialized().then((initialized) => !initialized),
      })
      .then((flag) => {
        flag &&
          fs.writeFile(lockDbFile, '', {}, (err) => {
            if (err) this.logger.error(err.message);

            this.logger.log('DB initialize success!');
          });

        !flag && this.logger.log('DB has been already initialized!');

        return flag;
      });
  }

  /**
   * 根据参数初始化表数据
   */
  initDatas(initArgs: InitArgs): Promise<boolean> {
    return this.dbInitDataSource.initDatas(initArgs);
  }
}
