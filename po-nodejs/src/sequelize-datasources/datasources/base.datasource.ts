import { ModuleRef } from '@nestjs/core';
import { OnModuleInit, Logger } from '@nestjs/common';
import { Sequelize, ModelDefined, ModelType, Op } from 'sequelize';
import { kebabCase, isUndefined } from 'lodash';
import { ForbiddenError } from '@/common/utils/gql-errors.utils';
import { UserRoleCapability, OptionAutoload } from '@/common/helpers/enums';

import { EntityService } from '@/sequelize-entities/entity.service';
import { ConfigService } from '@/config/config.service';

// Types
import { ProjectionAlias } from 'sequelize';
import { Config } from '@/config/interfaces';
import { UserRoles } from '@/common/helpers/user-roles';

export abstract class BaseDataSource implements OnModuleInit {
  private __AUTOLOAD_OPTIONS__: Dictionary<string> | null = null;
  private __USER_ROLES__: UserRoles | null = null;
  protected readonly logger = new Logger('DataSource');
  protected entity!: EntityService;
  protected config!: ConfigService;

  constructor(protected readonly moduleRef: ModuleRef) {}

  async onModuleInit() {
    this.entity = this.moduleRef.get(EntityService, { strict: false });
    this.config = this.moduleRef.get(ConfigService, { strict: false });
  }

  protected get Sequelize() {
    return Sequelize;
  }

  protected get Op() {
    return Op;
  }

  protected get sequelize() {
    return this.entity.sequelize;
  }

  protected get models() {
    return this.entity.models;
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
    return this.config.get('table_prefix');
  }

  /**
   * 修改 Options 时重置，下次重新加载
   */
  protected resetOptions() {
    this.__AUTOLOAD_OPTIONS__ = null;
    this.__USER_ROLES__ == null;
  }

  /**
   * 获取配置
   */
  protected getConfig(key: keyof Config) {
    return this.config.get(key);
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
   * 验证用户是否有功能操作权限，如果没有则抛出 ForbiddenError
   * @param capability 验证的功能
   * @param requestUser 请求的用户
   * @param message 错误消息
   */
  protected async hasCapability(capability: UserRoleCapability, requestUser: JwtPayload, message?: string) {
    const userRoleCapabilities =
      requestUser && requestUser.role ? (await this.userRoles)[requestUser.role].capabilities : [];

    if (!userRoleCapabilities.length || !userRoleCapabilities.some((userCapability) => userCapability === capability)) {
      throw new ForbiddenError(
        message || `Access denied! You don't have capability "${kebabCase(capability)}" for this action!`,
      );
    }
  }

  /**
   * 获取 option value
   * @param optionName optionName
   */
  protected async getOption<R extends string>(optionName: string): Promise<R | undefined> {
    let value = (await this.autoloadOptions)[optionName] as R | undefined;
    if (isUndefined(value)) {
      // 如果没有在autoload中时，从数据库查询
      const option = await this.models.Options.findOne({
        attributes: ['optionValue'],
        where: {
          optionName,
          autoload: OptionAutoload.No,
        },
      });
      value = option ? (option.optionValue as R) : undefined;
    }
    return value;
  }
}
