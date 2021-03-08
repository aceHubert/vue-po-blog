import { IsNotEmpty, MinLength, IsLocale, IsUrl, IsEmail } from 'class-validator';
import { error as globalError } from '@vue-async/utils';
import { configs } from '@/utils/getConfig';
import dbModels, { sequelize } from '../entities';
import { PostCommentStatus, UserRole } from './enums';
import UserRoles from './userRoles';

// Types
import { Sequelize, SyncOptions } from 'sequelize';
import { KeyValueCache } from 'apollo-server-caching';

export enum InitOptionKeys {
  SiteUrl = 'siteurl', //资源文件 baseUrl
  Home = 'home', // 前端显示的地址
  BlogName = 'blog_name',
  BlogDescription = 'blog_description',
  UsersCanRegister = 'users_can_register', // 是否支持用户注册, 0 or 1
  AdminEmail = 'admin_email',
  StartOfWeek = 'start_of_week', // 1-7
  DateFormat = 'date_format', // 日期格式化，默认 Feb 2,2019. 参考 moment,
  TimeFormat = 'time_format', // 时间格式化，默认：9:08 am. 参考 moment
  TimezoneString = 'timezone_string', // 时区，默认： UTC+0
  MailServerUrl = 'mailserver_url', // email 服务器配置
  MailServerLogin = 'mailserver_login',
  MailServerPass = 'mailserver_pass',
  MailServerPort = 'mailserver_port',
  PermalinkStructure = 'permalink_structure', // 永久链接显示方式
  DefaultCategory = 'default_category', // Post 默认分类
  DefaultCommentStatus = 'default_comment_status', // Post 默认评论状态
  ShowOnFront = 'show_on_front', // 首页显示的内容, post or page
  PageForPosts = 'page_for_posts', // Posts 列表页显示的页面
  PageOnFront = 'page_on_front', // 首页显示的页面, 如果 ShowOnFort = page
  PostsPerPage = 'posts_per_page', // Post 分页数
  PageComments = 'page_comments', // Page 启用评论, 0 or 1
  CommentsPerPage = 'comments_per_page', // 评论分页数
  CommentsOrder = 'comments_order', // 评论排序，asc or desc
  CommentsNested = 'comments_nested', // 评论启用嵌套, 0 or 1
  CommentsNestedDepth = 'comments_nusted_depth', // 评论嵌套深度
  ActivePlugins = 'active_plugins', // 当前启用的插件
  CurrentTheme = 'current_theme', // 当前使用的主题
  DefaultRole = 'default_role', // 默认用户角色
}

// key 需要添加表前缀的keys
export enum InitOptionTablePrefixKeys {
  UserRoles = 'user_roles', // 用户角色配置
  Locale = 'locale', // 默认语言
}

export class InitDBArgs {
  @IsNotEmpty({ message: '博客标题不能为空！' })
  title!: string;

  @IsNotEmpty({ message: '管理员登录密码不可为空！' })
  @MinLength(6, { message: '管理员登录密码必须大于6位' })
  password!: string;

  @IsNotEmpty({ message: '默认使用语言不可为空！' })
  @IsLocale({ message: '默认使用语言格式不正确' })
  locale!: string;

  @IsNotEmpty({ message: '初始化客户端链接不可为空（作为 site_url 和 home_url 的初始值）！' })
  // eslint-disable-next-line @typescript-eslint/camelcase
  @IsUrl({ require_tld: false }, { message: '链接格式不正确' })
  siteUrl!: string;

  @IsNotEmpty({ message: '管理员邮箱不可为空！' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email!: string;
}

export default class InitHelper {
  // @ts-ignore
  private cache!: KeyValueCache;
  private models = dbModels;

  constructor(cache: KeyValueCache) {
    this.cache = cache;
  }

  private get tablePrefix() {
    return configs.get('table_prefix');
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
  ): Promise<boolean | Error> {
    try {
      await sequelize.authenticate();
    } catch (err) {
      globalError(process.env.NODE_ENV === 'production', 'Unable to connect to the database');
      return err;
    }

    try {
      // eslint-disable-next-line prefer-const
      let { when = true, ...syncOptions } = options || {};
      if (typeof when === 'function') {
        when = await when.call(null, sequelize);
      }
      if (when) {
        await sequelize.sync(syncOptions);
        return true;
      }
      return false;
    } catch (err) {
      globalError(process.env.NODE_ENV === 'production', 'Unable to sync to the database, Error:' + err.message);
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
    if (configs.get('DB_DIALECT') === 'mysql') {
      return sequelize
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
  async initDatas(initArgs: InitDBArgs): Promise<boolean> {
    const t = await sequelize.transaction();
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
      globalError(process.env.NODE_ENV === 'production', 'An error occurred during init datas, Error:' + err.message);
      return false;
    }
  }
}
