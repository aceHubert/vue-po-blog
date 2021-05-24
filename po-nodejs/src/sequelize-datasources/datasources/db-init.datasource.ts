import { ModuleRef } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { UserRoles } from '@/common/utils/user-roles.util';
import { OptionKeys, OptionTablePrefixKeys } from '@/common/utils/option-keys.util';
import { UserMetaKeys, UserMetaTablePrefixKeys } from '@/common/utils/user-meta-keys.util';
import { UserRole } from '@/users/enums';
import { PostCommentStatus } from '@/posts/enums';
import { BaseDataSource } from './base.datasource';

// Types
import { Sequelize, SyncOptions } from 'sequelize';
import { InitArgs } from '../interfaces/init-args.interface';

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
      this.logger.error(`Unable to connect to the database, Error: ${err.message}`);
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
      this.logger.error(`Unable to sync to the database, Error: ${err.message}`);
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
    const dialect = this.getConfig('db_dialect');
    if (dialect === 'mysql') {
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
      this.logger.warn(`${dialect} is not supported!`);
      return Promise.resolve(true);
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
  async initDatas(initArgs: InitArgs): Promise<true> {
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
            metaKey: UserMetaKeys.NickName,
            metaValue: name,
          },
          {
            userId: user.id,
            metaKey: UserMetaKeys.FirstName,
            metaValue: '',
          },
          {
            userId: user.id,
            metaKey: UserMetaKeys.LastName,
            metaValue: '',
          },
          {
            userId: user.id,
            metaKey: UserMetaKeys.Avator,
            metaValue: '',
          },
          {
            userId: user.id,
            metaKey: UserMetaKeys.Description,
            metaValue: '',
          },
          {
            userId: user.id,
            metaKey: `${this.tablePrefix}${UserMetaTablePrefixKeys.UserRole}`,
            metaValue: UserRole.Administrator,
          },
          {
            userId: user.id,
            metaKey: UserMetaKeys.Locale,
            metaValue: '',
          },
          {
            userId: user.id,
            metaKey: UserMetaKeys.AdminColor,
            metaValue: 'default',
          },
        ],
        {
          transaction: t,
        },
      );

      // 初始化默认分类
      const defautlCategoryName = await this.i18nService.tv(
        'core.datasource.default_data.uncategorized',
        'Uncategorized',
        {
          lang: initArgs.locale,
        },
      );
      const defaultCategory = await this.models.Terms.create(
        { name: defautlCategoryName, slug: 'uncategorized' },
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
      const defaultArticleTitle = await this.i18nService.tv(
        'core.datasource.default_data.article_title',
        'Simple Article',
        {
          lang: initArgs.locale,
        },
      );
      const defaultArticleContent = await this.i18nService.tv(
        'datasource.default_data.article_content',
        '<p>This is your first article.</p>',
        {
          lang: initArgs.locale,
        },
      );
      await this.models.Posts.bulkCreate(
        [
          {
            title: defaultArticleTitle,
            name: 'article',
            author: 1,
            content: `<p>${defaultArticleContent}</p>`,
            excerpt: '',
          },
        ],
        { transaction: t },
      );

      // 初始化配置参数
      await this.models.Options.bulkCreate(
        [
          { optionName: OptionKeys.SiteUrl, optionValue: initArgs.siteUrl },
          { optionName: OptionKeys.Home, optionValue: initArgs.homeUrl },
          { optionName: OptionKeys.BlogName, optionValue: initArgs.title },
          { optionName: OptionKeys.BlogDescription, optionValue: 'A simple and light blog system' },
          { optionName: OptionKeys.AdminEmail, optionValue: initArgs.email },
          { optionName: OptionKeys.AdminLayout, optionValue: '{}' },
          { optionName: OptionKeys.UsersCanRegister, optionValue: 'off' },
          { optionName: OptionKeys.MailServerUrl, optionValue: 'mail.example.com' },
          { optionName: OptionKeys.MailServerLogin, optionValue: 'user@example.com' },
          { optionName: OptionKeys.MailServerPass, optionValue: 'password' },
          { optionName: OptionKeys.MailServerPort, optionValue: '110' },
          { optionName: OptionKeys.StartOfWeek, optionValue: '1' },
          { optionName: OptionKeys.DateFormat, optionValue: 'MMM D,YYYY' },
          { optionName: OptionKeys.TimeFormat, optionValue: 'h:mm a' },
          { optionName: OptionKeys.TimezoneString, optionValue: '' },
          { optionName: OptionKeys.PermalinkStructure, optionValue: '' },
          { optionName: OptionKeys.DefaultCategory, optionValue: String(defaultCategoryTaxonomy.id) },
          { optionName: OptionKeys.DefaultCommentStatus, optionValue: PostCommentStatus.Enable },
          { optionName: OptionKeys.ShowOnFront, optionValue: 'post' },
          { optionName: OptionKeys.PageOnFront, optionValue: '0' },
          { optionName: OptionKeys.PageForPosts, optionValue: '0' },
          { optionName: OptionKeys.PageComments, optionValue: 'off' },
          { optionName: OptionKeys.PostsPerPage, optionValue: '10' },
          { optionName: OptionKeys.CommentsPerPage, optionValue: '5' },
          { optionName: OptionKeys.CommentsOrder, optionValue: 'asc' },
          { optionName: OptionKeys.CommentsNested, optionValue: 'on' },
          { optionName: OptionKeys.CommentsNestedDepth, optionValue: '2' },
          { optionName: OptionKeys.ThumbnailSizeWidth, optionValue: '150' },
          { optionName: OptionKeys.ThumbnailSizeHeight, optionValue: '150' },
          { optionName: OptionKeys.ThumbnailCrop, optionValue: '1' },
          { optionName: OptionKeys.MediumSizeWidth, optionValue: '300' },
          { optionName: OptionKeys.MediumSizeHeight, optionValue: '300' },
          { optionName: OptionKeys.MediumLargeSizeWidth, optionValue: '768' },
          { optionName: OptionKeys.MediumLargeSizeHeight, optionValue: '0' },
          { optionName: OptionKeys.LargeSizeWidth, optionValue: '1200' },
          { optionName: OptionKeys.LargeSizeHeight, optionValue: '1200' },
          { optionName: OptionKeys.CurrentTheme, optionValue: 'beautify_theme' },
          { optionName: OptionKeys.ActivePlugins, optionValue: '{}' },
          { optionName: OptionKeys.DefaultRole, optionValue: UserRole.Subscriber },
          // 带数据库前缀属性
          { optionName: `${this.tablePrefix}${OptionTablePrefixKeys.Locale}`, optionValue: initArgs.locale },
          {
            optionName: `${this.tablePrefix}${OptionTablePrefixKeys.UserRoles}`,
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
      throw err;
    }
  }
}
