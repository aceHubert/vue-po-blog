import { ModuleRef } from '@nestjs/core';
import { OnModuleInit, Logger } from '@nestjs/common';
import { Sequelize, ModelDefined, ModelType, Op } from 'sequelize';
import { I18nService } from 'nestjs-i18n';
import { ConfigService } from '@/config/config.service';
import { EntityService } from '@/sequelize-entities/entity.service';
import { kebabCase, isUndefined } from 'lodash';
import { ForbiddenError } from '@/common/utils/errors.util';
import { UserCapability } from '@/common/utils/user-capability.util';
import { OptionAutoload } from '@/options/enums';

// Types
import { ProjectionAlias } from 'sequelize';
import { ConfigOptions } from '@/config/interfaces';
import { UserRoles } from '@/common/utils/user-roles.util';

export abstract class BaseDataSource implements OnModuleInit {
  private __AUTOLOAD_OPTIONS__: Dictionary<string> | null = null;
  private __USER_ROLES__: UserRoles | null = null;
  protected readonly logger!: Logger;
  protected entityService!: EntityService;
  protected configService!: ConfigService;
  protected i18nService!: I18nService;

  constructor(protected readonly moduleRef: ModuleRef) {
    this.logger = new Logger(this.constructor.name);
  }

  async onModuleInit() {
    this.entityService = this.moduleRef.get(EntityService, { strict: false });
    this.configService = this.moduleRef.get(ConfigService, { strict: false });
    this.i18nService = this.moduleRef.get(I18nService, { strict: false });
  }

  protected get Sequelize() {
    return Sequelize;
  }

  protected get Op() {
    return Op;
  }

  protected get sequelize() {
    return this.entityService.sequelize;
  }

  protected get models() {
    return this.entityService.models;
  }

  protected get autoloadOptions() {
    // 避免每次从缓存字符串序列化
    if (this.__AUTOLOAD_OPTIONS__) {
      return Promise.resolve(this.__AUTOLOAD_OPTIONS__);
    } else {
      return (async () => {
        // 赋默认值，initialize 会多次执行
        const autoloadOptions: Dictionary<string> = await this.models.Options.findAll({
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

        this.__AUTOLOAD_OPTIONS__ = autoloadOptions;
        return autoloadOptions;
      })();
    }
  }

  protected get userRoles() {
    // 避免每次字符串序列化
    if (this.__USER_ROLES__) {
      return Promise.resolve(this.__USER_ROLES__);
    } else {
      return (async () => {
        const userRoles = JSON.parse((await this.autoloadOptions)[`${this.tablePrefix}user_roles`]) as UserRoles;
        this.__USER_ROLES__ = userRoles;
        return userRoles;
      })();
    }
  }

  /**
   * table 前缀
   */
  protected get tablePrefix() {
    return this.configService.get('table_prefix');
  }

  /**
   * 获取配置
   */
  protected getConfig(key: keyof ConfigOptions) {
    return this.configService.get(key);
  }

  /**
   * 修改 Options 时重置，下次重新加载
   */
  protected resetOptions() {
    this.__AUTOLOAD_OPTIONS__ = null;
    this.__USER_ROLES__ == null;
  }

  /**
   * 过滤非数据库字段造成的异常
   * @param fields 字段名
   * @param rawAttributes ORM 实体对象属性
   */
  protected filterFields(fields: string[], model: ModelType): (string | ProjectionAlias)[] {
    const columns = Object.keys(model.rawAttributes);
    return fields.filter((field) => columns.includes(field));
  }

  /**
   * 获取 Sequelize mapping 到数据库的字段名
   * @param fieldName 实体模型字段名
   * @param model 实体模型
   */
  protected field<TAttributes extends {} = any>(
    fieldName: keyof TAttributes | 'createdAt' | 'updatedAt',
    model: ModelDefined<TAttributes, any>,
  ) {
    const field = model.rawAttributes[fieldName as string];
    return field && field.field ? field.field : fieldName;
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
    model: ModelDefined<TAttributes, any>,
    modelName?: string,
  ) {
    return this.Sequelize.col(`${modelName || model.name}.${this.field(fieldName, model)}`);
  }

  /**
   * 验证用户是否有功能操作权限
   * @param capability 验证的功能
   * @param requestUser 请求的用户
   * @param callbackOrThrow 当为 function 时如果验证不过参数 error 将是 ForbiddenError，否则为null; 为 ture 时，验证不过则抛出异常
   */
  protected async hasCapability(capability: UserCapability, requestUser: RequestUser): Promise<boolean>;
  protected async hasCapability(
    capability: UserCapability,
    requestUser: RequestUser,
    callbackOrThrow: true | ((error: Error | null) => void),
  ): Promise<void>;
  protected async hasCapability(
    capability: UserCapability,
    requestUser: RequestUser,
    callbackOrThrow?: true | ((error: Error | null) => void),
  ): Promise<boolean | void> {
    const userRoleCapabilities =
      requestUser && requestUser.role ? (await this.userRoles)[requestUser.role].capabilities : [];

    const result = Boolean(
      userRoleCapabilities.length && userRoleCapabilities.some((userCapability) => userCapability === capability),
    );

    if (callbackOrThrow) {
      const callback =
        typeof callbackOrThrow === 'function'
          ? callbackOrThrow
          : (error: Error | null) => {
              if (error) throw error;
            };

      return callback(
        !result
          ? new ForbiddenError(
              await this.i18nService.tv(
                'core.error.forbidden_capability',
                `Access denied, You don't have capability "${kebabCase(capability)}" for this action!`,
                {
                  lang: requestUser.lang,
                  args: { requiredCapability: kebabCase(capability) },
                },
              ),
            )
          : null,
      );
    } else {
      return result;
    }
  }

  /**
   * 获取 option value (autoload option 有缓存)
   * @param optionName optionName（如有前缀需要输入全称）
   */
  public async getOption<R extends string>(optionName: string): Promise<R | undefined> {
    let value = (await this.autoloadOptions)[optionName] as R | undefined;
    // 如果没有在autoload中时，从数据库查询
    if (isUndefined(value)) {
      const option = await this.models.Options.findOne({
        attributes: ['optionValue'],
        where: {
          optionName,
          autoload: OptionAutoload.No,
        },
      });
      value = option?.optionValue as R;
    }
    return value;
  }
}
