import { DataSource } from 'apollo-datasource';
import { Sequelize, ModelCtor, Model, Op } from 'sequelize';
import { kebabCase, isUndefined } from 'lodash';
import { AuthenticationError, ForbiddenError } from '@/utils/errors';
import { configs } from '@/utils/getConfig';
import { UserRoleCapabilities, OptionAutoload } from './helper/enums';
import UserRoles from './helper/userRoles';
import dbModels, { sequelize } from './entities';

// Types
import { DataSourceConfig } from 'apollo-datasource';
import { KeyValueCache } from 'apollo-server-caching';

export class SequelizeDataSource extends DataSource {
  private readonly __AUTOLOAD_OPTIONS_CACHEKEY__ = '__AUTOLOAD_OPTIONS__';
  private __AUTOLOAD_OPTIONS__: Dictionary<string> | null = null;

  protected content!: ContextType;
  protected cache!: KeyValueCache;
  protected sequelize = sequelize;
  protected Sequelize = Sequelize;
  protected Op = Op;
  protected models = dbModels;

  async initialize(config: DataSourceConfig<ContextType>) {
    this.content = config.context;
    this.cache = config.cache;
  }

  protected get autoloadOptions() {
    // 避免每次从缓存字符串序列化
    if (this.__AUTOLOAD_OPTIONS__) {
      return Promise.resolve(this.__AUTOLOAD_OPTIONS__);
    } else {
      return (async () => {
        const autoloadOptionsStr = await this.cache.get(this.__AUTOLOAD_OPTIONS_CACHEKEY__);
        let autoloadOptions: Dictionary<string> = {};
        if (autoloadOptionsStr) {
          autoloadOptions = JSON.parse(autoloadOptionsStr) as Dictionary<string>;
        } else {
          // 赋默认值，initialize 会多次执行
          autoloadOptions = await this.models.Options.findAll({
            attributes: ['optionName', 'optionValue'],
            where: {
              autoload: OptionAutoload.Yes,
            },
          }).then((options) =>
            options.reduce((prev, curr) => {
              prev[curr.optionName] = curr.optionValue;
              return prev;
            }, {} as Dictionary<string>),
          );
          Object.keys(autoloadOptions).length > 0 &&
            (await this.cache.set(this.__AUTOLOAD_OPTIONS_CACHEKEY__, JSON.stringify(autoloadOptions)));
        }
        this.__AUTOLOAD_OPTIONS__ = autoloadOptions;
        return autoloadOptions;
      })();
    }
  }

  /**
   * table 前缀
   */
  protected get tablePrefix() {
    return configs.get('table_prefix');
  }

  /**
   * 清除 autoload options 缓存
   * 下一次使用时会自动从数据库加载并缓存起来
   */
  protected clearAutoloadOptionCache() {
    this.__AUTOLOAD_OPTIONS__ = null;
    return this.cache.delete(this.__AUTOLOAD_OPTIONS_CACHEKEY__);
  }

  /**
   * 过滤非数据库字段造成的异常
   * @param fields 字段名
   * @param rawAttributes ORM 实体对象属性
   */
  protected filterFields(fields: string[], model: ModelCtor<Model<any, any>>) {
    const columns = Object.keys(model.rawAttributes);
    return fields.filter((field) => columns.includes(field));
  }

  /**
   * Sequelize.col 增强方法
   * 默认不会 mapper 到数据库字段名，返回Sequelize.col('modelName.field')
   * @param fieldName 实体模型字段名
   * @param model 实体模型
   * @param modelName 实体模型映射名称（默认为model.name）
   */
  protected col<TAttributes extends {} = any>(
    fieldName: keyof TAttributes | 'createdAt' | 'updatedAt',
    model: ModelCtor<Model<TAttributes>>,
    modelName?: string,
  ) {
    return this.Sequelize.col(`${modelName || model.name}.${this.field(fieldName, model)}`);
  }

  /**
   * 获取 Sequelize mapping 到数据库的字段名
   * @param fieldName 实体模型字段名
   * @param model 实体模型
   */
  protected field<TAttributes extends {} = any>(
    fieldName: keyof TAttributes | 'createdAt' | 'updatedAt',
    model: ModelCtor<Model<TAttributes>>,
  ) {
    const field = model.rawAttributes[fieldName as string];
    return field && field.field ? field.field : fieldName;
  }

  /**
   * 验证content.user是否在在，如果没有则抛出 AuthenticationError
   * @param message 错误消息
   */
  protected isAuthorized(message?: string) {
    if (!this.content.user || !this.content.user.role) {
      throw new AuthenticationError(message || "Access denied! You don't have permission for this action!");
    }
  }

  /**
   * 验证用户是否有功能操作权限，如果没有则抛出 ForbiddenError
   * @param capability 验证的功能
   * @param message 错误消息
   */
  protected hasCapability(capability: UserRoleCapabilities, message?: string) {
    const userRoleCapabilities =
      this.content.user && this.content.user.role ? UserRoles[this.content.user.role].capabilities : [];

    if (!userRoleCapabilities.length || !userRoleCapabilities.some((userCapability) => userCapability === capability)) {
      throw new ForbiddenError(
        message || `Access denied! You don't have capability "${kebabCase(capability)}" for this action!`,
      );
    }
  }

  /**
   * 获取 option
   * @param name optionName
   */
  protected async getOption<R extends string>(name: string): Promise<R | undefined> {
    let value = (await this.autoloadOptions)[name] as R | undefined;
    if (isUndefined(value)) {
      // 如果没有在autoload中时，从数据库查询
      const option = await this.models.Options.findOne({
        attributes: ['optionValue'],
        where: {
          optionName: name,
          autoload: OptionAutoload.No,
        },
      });
      value = option ? (option.optionValue as R) : undefined;
    }
    return value;
  }
}
