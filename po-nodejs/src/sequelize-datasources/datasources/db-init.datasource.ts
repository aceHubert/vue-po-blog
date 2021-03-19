import { ModuleRef } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import warning from 'warning';
import { PostCommentStatus, UserRole } from '@/common/helpers/enums';
import { UserRoles } from '@/common/helpers/user-roles';
import { InitOptionKeys, InitOptionTablePrefixKeys } from '@/common/helpers/init-option-keys';
import { BaseDataSource } from './base.datasource';

// Types
import { Sequelize, SyncOptions } from 'sequelize';
import { InitArgs } from '../interfaces';

@Injectable()
export class DbInitDataSource extends BaseDataSource {
  constructor(protected readonly moduleRef: ModuleRef) {
    super(moduleRef);
  }

  /**
   * 初始化数据库表结构
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param options 初始化参数
   * @returns true: 生成数据库成功；false: 跳过数据库生成(when 条件不满足) 否则抛出 Error
   */
  async initDB(
    options?: SyncOptions & { when?: boolean | ((sequelize: Sequelize) => Promise<boolean>) },
  ): Promise<boolean> {
    try {
      await this.sequelize.authenticate();
    } catch (err) {
      warning(process.env.NODE_ENV === 'production', 'Unable to connect to the database');
      throw err;
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
      warning(process.env.NODE_ENV === 'production', 'Unable to sync to the database, Error:' + err.message);
      throw err;
    }
  }

  /**
   * 检查是否在在表，用于初始化表结构
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   */
  haveTables(): Promise<boolean> {
    if (this.getConfig('DB_DIALECT') === 'mysql') {
      return this.sequelize
        .query(
          'select count(1) as tableCount from `INFORMATION_SCHEMA`.`TABLES` where `TABLE_SCHEMA`= (select database())',
        )
        .then(([value]) => {
          // 当没有表的时候初始化
          return (value as any)[0].tableCount > 0;
        });
    } else {
      // todo: 其它数据库
      return Promise.resolve(false);
    }
  }

  /**
   * 实始化数据（必须在DB初始化表结构后调用）
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param initArgs 初始化参数
   */
  async initDatas(initArgs: InitArgs): Promise<boolean> {
    const t = await this.sequelize.transaction();
    try {
      // 默认用户
      const name = 'admin';
      const user = await this.models.Users.create(
        {
          loginName: name,
          loginPwd: initArgs.password,
          displayName: name,
          niceName: name,
          url: initArgs.siteUrl,
          email: initArgs.email,
        },
        {
          transaction: t,
        },
      );
      await this.models.UserMeta.bulkCreate(
        [
          {
            userId: user.id,
            metaKey: `nickName`,
            metaValue: name,
          },
          {
            userId: user.id,
            metaKey: `first_name`,
            metaValue: '',
          },
          {
            userId: user.id,
            metaKey: `last_name`,
            metaValue: '',
          },
          {
            userId: user.id,
            metaKey: `description`,
            metaValue: '',
          },
          {
            userId: user.id,
            metaKey: `${this.tablePrefix}role`,
            metaValue: UserRole.Administrator,
          },
          {
            userId: user.id,
            metaKey: 'locale',
            metaValue: initArgs.locale,
          },
        ],
        {
          transaction: t,
        },
      );

      // 初始化默认分类
      const defaultCategory = await this.models.Terms.create(
        { name: 'Uncategorized', slug: 'uncategorized' },
        {
          transaction: t,
        },
      );
      const defaultCategoryTaxonomy = await this.models.TermTaxonomy.create(
        { termId: defaultCategory.id, taxonomy: 'category', description: '' },
        {
          transaction: t,
        },
      );

      // 初始化页面和文章
      await this.models.Posts.bulkCreate(
        [{ title: 'Article', name: 'article', author: 1, content: '##### This is an article.' }],
        { transaction: t },
      );

      // 初始化配置参数
      await this.models.Options.bulkCreate(
        [
          { optionName: InitOptionKeys.SiteUrl, optionValue: initArgs.siteUrl },
          { optionName: InitOptionKeys.Home, optionValue: initArgs.siteUrl },
          { optionName: InitOptionKeys.BlogName, optionValue: initArgs.title },
          { optionName: InitOptionKeys.BlogDescription, optionValue: 'A simple and light blog system' },
          { optionName: InitOptionKeys.AdminEmail, optionValue: initArgs.email },
          { optionName: InitOptionKeys.UsersCanRegister, optionValue: '0' },
          { optionName: InitOptionKeys.MailServerUrl, optionValue: 'mail.example.com' },
          { optionName: InitOptionKeys.MailServerLogin, optionValue: 'user@example.com' },
          { optionName: InitOptionKeys.MailServerPass, optionValue: 'password' },
          { optionName: InitOptionKeys.MailServerPort, optionValue: '110' },
          { optionName: InitOptionKeys.StartOfWeek, optionValue: '1' },
          { optionName: InitOptionKeys.DateFormat, optionValue: 'MMM D,YYYY' },
          { optionName: InitOptionKeys.TimeFormat, optionValue: 'h:mm a' },
          { optionName: InitOptionKeys.TimezoneString, optionValue: '' },
          { optionName: InitOptionKeys.PermalinkStructure, optionValue: '' },
          { optionName: InitOptionKeys.DefaultCategory, optionValue: String(defaultCategoryTaxonomy.id) },
          { optionName: InitOptionKeys.DefaultCommentStatus, optionValue: PostCommentStatus.Enable },
          { optionName: InitOptionKeys.ShowOnFront, optionValue: 'post' },
          { optionName: InitOptionKeys.PageForPosts, optionValue: '0' },
          { optionName: InitOptionKeys.PageOnFront, optionValue: '0' },
          { optionName: InitOptionKeys.PageComments, optionValue: '0' },
          { optionName: InitOptionKeys.PostsPerPage, optionValue: '10' },
          { optionName: InitOptionKeys.CommentsPerPage, optionValue: '10' },
          { optionName: InitOptionKeys.CommentsOrder, optionValue: 'asc' },
          { optionName: InitOptionKeys.CommentsNested, optionValue: '1' },
          { optionName: InitOptionKeys.CommentsNestedDepth, optionValue: '5' },
          { optionName: InitOptionKeys.CurrentTheme, optionValue: 'beautify_theme' },
          { optionName: InitOptionKeys.ActivePlugins, optionValue: '{}' },
          { optionName: InitOptionKeys.DefaultRole, optionValue: UserRole.Subscriber },
          // 带数据库前缀属性
          { optionName: `${this.tablePrefix}${InitOptionTablePrefixKeys.Locale}`, optionValue: initArgs.locale },
          {
            optionName: `${this.tablePrefix}${InitOptionTablePrefixKeys.UserRoles}`,
            optionValue: JSON.stringify(UserRoles),
          },
        ],
        {
          transaction: t,
        },
      );

      await t.commit();
      return true;
    } catch (err) {
      await t.rollback();
      warning(process.env.NODE_ENV === 'production', 'An error occurred during init datas, Error:' + err.message);
      return false;
    }
  }
}
