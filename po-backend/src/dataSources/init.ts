import md5 from 'md5';
import { error as globalError } from '@vue-async/utils';
import { configs } from '@/utils/getConfig';
import { GetInitArgs } from '@/model/init';
import { SequelizeDataSource } from './sequelizeDataSource';

// Types
import { Sequelize, SyncOptions } from 'sequelize';

export default class InitDataSource extends SequelizeDataSource<ContextType> {
  /**
   * 初始化数据库表结构(true: 生成数据库成功；false: 跳过数据库生成)
   * @param options
   */
  async initDB(
    options?: SyncOptions & { when?: boolean | ((sequelize: Sequelize) => Promise<boolean>) },
  ): Promise<boolean | Error> {
    try {
      await this.sequelize.authenticate();
    } catch (error) {
      globalError(process.env.NODE_ENV === 'production', 'Unable to connect to the database');
      return error;
    }

    try {
      // eslint-disable-next-line prefer-const
      let { when = true, ...syncOptions } = options || {};
      if (typeof when === 'function') {
        when = await when.call(null, this.sequelize);
      }
      if (when) {
        await this.sequelize.sync(syncOptions);
        return true;
      }
      return false;
    } catch (err) {
      globalError(process.env.NODE_ENV === 'production', 'Unable to sync to the database, Error:' + err.message);
      return err;
    }
  }

  /**
   * 检查是否在在表，用于初始化表结构
   */
  haveTables(): Promise<boolean> {
    if (configs.get('DB_DIALECT') === 'mysql') {
      return this.sequelize
        .query(
          'select count(1) as tableCount from `INFORMATION_SCHEMA`.`TABLES` where `TABLE_SCHEMA`= (select database())',
        )
        .then(([value]) => {
          // 当没有表的时候初始化
          return (value as any)[0].tableCount > 0;
        });
    } else {
      // todl: 其它数据库
      return Promise.resolve(false);
    }
  }

  /**
   * 必须在DB初始化表结构后调用
   * @param initArgs
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async initDatas(initArgs: GetInitArgs): Promise<true | Error> {
    try {
      // 默认用户
      await this.models['Users'].create({
        loginName: 'admin',
        loginPwd: md5(initArgs.password),
        url: initArgs.url,
        email: initArgs.email,
      });
      // 初始化配置参数
      await this.models['Options'].bulkCreate([
        {
          optionName: 'siteurl',
          optionValue: initArgs.url,
        },
        {
          optionName: 'home',
          optionValue: initArgs.url,
        },
        {
          optionName: 'blogname',
          optionValue: initArgs.title,
        },
        {
          optionName: 'blogdescription',
          optionValue: 'A simple and light blog system',
        },
      ]);
      // 初始化页面和文章
      await this.models['Posts'].create({ title: '测试', name: 'test', author: 1, content: '', excerpt: '' });

      return true;
    } catch (err) {
      globalError(process.env.NODE_ENV === 'production', 'An error occurred during init datas, Error:' + err.message);
      return err;
    }
  }
}
