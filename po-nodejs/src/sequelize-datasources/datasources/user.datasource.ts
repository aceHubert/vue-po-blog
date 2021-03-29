import md5 from 'md5';
import { isUndefined } from 'lodash';
import { ModuleRef } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { ForbiddenError, ValidationError } from '@/common/utils/errors.utils';
import { UserRole, UserRoleCapability, UserStatus } from '@/common/helpers/enums';
import { UserMetaKeys, UserMetaTablePrefixKeys } from '@/common/helpers/user-meta-keys';
import { uuid } from '@/common/utils/uuid.utils';
import { MetaDataSource } from './meta.datasource';

// Types
import { WhereOptions } from 'sequelize';

import {
  UserModel,
  UserSimpleModel,
  UserWithRoleModel,
  UserMetaModel,
  PagedUserArgs,
  PagedUserModel,
  NewUserInput,
  NewUserMetaInput,
  UpdateUserInput,
} from '../interfaces/user.interface';

@Injectable()
export class UserDataSource extends MetaDataSource<UserMetaModel, NewUserMetaInput> {
  constructor(protected readonly moduleRef: ModuleRef) {
    super(moduleRef);
  }

  /**
   * 是否是超级管理员
   * @param loginNameOrId 登录名或User Id
   * @returns boolean
   */
  isSupurAdmin(loginNameOrId: string): boolean;
  isSupurAdmin(loginNameOrId: number): Promise<boolean>;
  isSupurAdmin(loginNameOrId: number | string) {
    if (typeof loginNameOrId === 'number') {
      return this.models.Users.count({
        where: {
          loginName: 'admin',
        },
      }).then((count) => count > 0);
    } else {
      return loginNameOrId === 'admin';
    }
  }

  /**
   * 根据 Id 获取用户（不包含登录密码）
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access capabilities: [EditUsers(optional)]
   * @param id User Id（null 则查询请求用户，否则需要 EditUsers 权限）
   * @param fields 返回的字段
   */
  async get(id: number | null, fields: string[], requestUser: JwtPayload): Promise<UserModel | null> {
    if (id) {
      await this.hasCapability(UserRoleCapability.EditUsers, requestUser);
    } else {
      id = requestUser.id;
    }

    // 排除登录密码
    fields = fields.filter((field) => field !== 'loginPwd');

    // 主键
    if (!fields.includes('id')) {
      fields.push('id');
    }

    // 如果要查是否是超级管理员，必须查询 loginName 字段
    if (fields.includes('isSuperAdmin') && !fields.includes('loginName')) {
      fields.push('loginName');
    }

    return this.models.Users.findByPk(id, {
      attributes: this.filterFields(fields, this.models.Users),
    }).then((user) => user?.toJSON() as UserModel);
  }

  /**
   * 根据 Id 获取用户
   * 实段：id, displayName, email
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access none
   * @param id User Id（null返回请求用户的实体）
   * @param fields 返回的字段
   */
  async getSimpleInfo(id: number, fields: string[]): Promise<UserSimpleModel | null> {
    // 过滤掉敏感字段
    fields = fields.filter((field) => ['id', 'displayName', 'email'].includes(field));

    return this.models.Users.findByPk(id, {
      attributes: this.filterFields(fields, this.models.Users),
    }).then((user) => user?.toJSON() as UserSimpleModel);
  }

  /**
   * 获取用户分页列表
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access capabilities: [ListUsers]
   * @param query 分页 Query 参数
   * @param fields 返回的字段
   */
  async getPaged(
    { offset, limit, ...query }: PagedUserArgs,
    fields: string[],
    requestUser: JwtPayload,
  ): Promise<PagedUserModel> {
    await this.hasCapability(UserRoleCapability.ListUsers, requestUser);

    const where: WhereOptions = {};
    if (query.keyword) {
      where['loginName'] = {
        [this.Op.like]: `%${query.keyword}%`,
      };
    }
    if (query.status) {
      where['status'] = query.status;
    }

    if (query.userRole) {
      if (query.userRole === 'none') {
        where[`$UserMetas.${this.field('metaValue', this.models.UserMeta)}$`] = {
          [this.Op.is]: null,
        };
      } else {
        where[`$UserMetas.${this.field('metaValue', this.models.UserMeta)}$`] = query.userRole;
      }
    } else {
      where[`$UserMetas.${this.field('metaValue', this.models.UserMeta)}$`] = {
        [this.Op.not]: null,
      };
    }

    // 如果要查是否是超级管理员，必须查询 loginName 字段
    if (fields.includes('isSuperAdmin') && !fields.includes('loginName')) {
      fields.push('loginName');
    }

    return this.models.Users.findAndCountAll({
      attributes: this.filterFields(fields, this.models.Users),
      include: [
        {
          model: this.models.UserMeta,
          as: 'UserMetas',
          where: {
            metaKey: `${this.tablePrefix}${UserMetaTablePrefixKeys.UserRole}`,
          },
          required: false,
          duplicating: false,
        },
      ],
      where: {
        ...where,
      },
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    }).then(({ rows, count: total }) => ({
      rows: rows.map((row) => {
        const { UserMetas, ...rest } = row.toJSON() as any;
        return {
          userRole: UserMetas.length ? UserMetas[0].metaValue : null,
          ...rest,
        } as UserWithRoleModel;
      }),
      total,
    }));
  }

  /**
   * 根据状态分组获取数量
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param type 类型
   */
  getCountByStatus() {
    return this.models.Users.count({
      attributes: ['status'],
      group: 'status',
    });
  }

  /**
   * 按角色分组获取数量
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   */
  getCountByRole() {
    return this.models.Users.count({
      attributes: [
        [this.Sequelize.fn('ifnull', this.col('metaValue', this.models.UserMeta, 'UserMetas'), 'none'), 'userRole'],
      ],
      include: [
        {
          model: this.models.UserMeta,
          as: 'UserMetas',
          where: {
            metaKey: `${this.tablePrefix}${UserMetaTablePrefixKeys.UserRole}`,
          },
          required: false,
          duplicating: false,
        },
      ],
      group: 'userRole',
    });
  }

  /**
   * 判断登录名是否在在
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param loginName 登录名
   */
  async isLoginNameExists(loginName: string): Promise<boolean> {
    return (
      (await this.models.Users.count({
        where: {
          loginName,
        },
      })) > 0
    );
  }

  /**
   * 判断手机号码是否在在
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param mobile 手机号码
   */
  async isMobileExists(mobile: string): Promise<boolean> {
    return (
      (await this.models.Users.count({
        where: {
          mobile,
        },
      })) > 0
    );
  }

  /**
   * 判断电子邮箱是否在在
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param email 电子邮箱
   */
  async isEmailExists(email: string): Promise<boolean> {
    return (
      (await this.models.Users.count({
        where: {
          email,
        },
      })) > 0
    );
  }

  /**
   * 添加用户
   * loginName, mobile, emaile 要求必须是唯一，否则会抛出 ValidationError
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access capabilities: [CreateUsers]
   * @param model 添加实体模型
   * @param fields 返回的字段
   */
  async create(model: NewUserInput, requestUser: JwtPayload): Promise<UserModel> {
    await this.hasCapability(UserRoleCapability.CreateUsers, requestUser);

    let isExists =
      (await this.models.Users.count({
        where: {
          [this.Op.or]: {
            loginName: model.loginName,
            email: model.email,
          },
        },
      })) > 0;

    if (model.mobile && !isExists) {
      isExists = await this.isMobileExists(model.mobile);
    }

    if (isExists) {
      throw new ValidationError('The loginName, mobile, email are rqiured to be unique!');
    }

    const { loginName, loginPwd, firstName, lastName, avator, description, userRole, locale, ...rest } = model;

    const t = await this.sequelize.transaction();
    try {
      const user = await this.models.Users.create(
        {
          ...rest,
          loginName,
          loginPwd,
          niceName: loginName,
          displayName: loginName,
        },
        { transaction: t },
      );

      let metaCreationModels: NewUserMetaInput[] = [
        {
          userId: user.id,
          metaKey: UserMetaKeys.NickName,
          metaValue: loginName,
        },
        {
          userId: user.id,
          metaKey: UserMetaKeys.FirstName,
          metaValue: firstName || null,
        },
        {
          userId: user.id,
          metaKey: UserMetaKeys.LastName,
          metaValue: lastName || null,
        },
        {
          userId: user.id,
          metaKey: UserMetaKeys.Avator,
          metaValue: avator || null,
        },
        {
          userId: user.id,
          metaKey: UserMetaKeys.Description,
          metaValue: description || null,
        },
        {
          userId: user.id,
          metaKey: UserMetaKeys.Locale,
          metaValue: locale || null,
        },
        {
          userId: user.id,
          metaKey: UserMetaKeys.AdminColor,
          metaValue: 'default',
        },
        {
          userId: user.id,
          metaKey: `${this.tablePrefix}${UserMetaTablePrefixKeys.UserRole}`,
          metaValue: userRole,
        },
      ];
      // 添加元数据
      if (model.metas) {
        metaCreationModels = metaCreationModels.concat(
          model.metas.map((meta) => ({
            ...meta,
            userId: user.id,
          })),
        );
      }

      await this.models.UserMeta.bulkCreate(metaCreationModels, { transaction: t });

      await t.commit();

      // 排除登录密码
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { loginPwd: pwd, ...restUser } = user.toJSON() as any;
      return restUser as UserModel;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  /**
   * 修改用户
   * mobile, email 要求必须是唯一，否则会抛出 ValidationError
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access capabilities: [EditUsers(非修改自己信息)]
   * @param id User Id
   * @param model 修改实体模型
   */
  async update(id: number, model: UpdateUserInput, requestUser: JwtPayload): Promise<boolean> {
    // 非修改自己信息
    if (id !== requestUser.id) {
      await this.hasCapability(UserRoleCapability.EditUsers, requestUser);
    }

    const user = await this.models.Users.findByPk(id);
    if (user) {
      let isExists = false;
      if (model.email && model.email !== user.email) {
        isExists = await this.isEmailExists(model.email);
      }
      if (!isExists && model.mobile && model.mobile !== user.mobile) {
        isExists == (await this.isMobileExists(model.mobile));
      }
      if (isExists) {
        throw new ValidationError('The mobile, email are rqiured to be unique!');
      }

      const { nickName, firstName, lastName, avator, description, adminColor, userRole, locale, ...updateUser } = model;
      const t = await this.sequelize.transaction();
      try {
        await this.models.Users.update(updateUser, {
          where: { id },
          transaction: t,
        });

        if (!isUndefined(userRole)) {
          await this.models.UserMeta.update(
            { metaValue: userRole === 'none' ? null : userRole },
            {
              where: {
                userId: id,
                metaKey: `${this.tablePrefix}${UserMetaTablePrefixKeys.UserRole}`,
              },
              transaction: t,
            },
          );
        }

        if (!isUndefined(locale)) {
          await this.models.UserMeta.update(
            { metaValue: locale || null }, // "" => null
            {
              where: {
                userId: id,
                metaKey: UserMetaKeys.Locale,
              },
              transaction: t,
            },
          );
        }

        if (!isUndefined(description)) {
          await this.models.UserMeta.update(
            { metaValue: description },
            {
              where: {
                userId: id,
                metaKey: UserMetaKeys.Description,
              },
              transaction: t,
            },
          );
        }
        if (!isUndefined(adminColor)) {
          await this.models.UserMeta.update(
            { metaValue: adminColor },
            {
              where: {
                userId: id,
                metaKey: UserMetaKeys.AdminColor,
              },
              transaction: t,
            },
          );
        }
        if (!isUndefined(nickName)) {
          await this.models.UserMeta.update(
            { metaValue: nickName },
            {
              where: {
                userId: id,
                metaKey: UserMetaKeys.NickName,
              },
              transaction: t,
            },
          );
        }
        if (!isUndefined(firstName)) {
          await this.models.UserMeta.update(
            { metaValue: firstName },
            {
              where: {
                userId: id,
                metaKey: UserMetaKeys.FirstName,
              },
              transaction: t,
            },
          );
        }
        if (!isUndefined(lastName)) {
          await this.models.UserMeta.update(
            { metaValue: lastName },
            {
              where: {
                userId: id,
                metaKey: UserMetaKeys.LastName,
              },
              transaction: t,
            },
          );
        }
        if (!isUndefined(avator)) {
          await this.models.UserMeta.update(
            { metaValue: avator },
            {
              where: {
                userId: id,
                metaKey: UserMetaKeys.Avator,
              },
              transaction: t,
            },
          );
        }

        await t.commit();
        return true;
      } catch (err) {
        await t.rollback();
        throw err;
      }
    }
    return false;
  }

  /**
   * 修改用户状态
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access capabilities: [EditUsers]
   * @param id User Id
   * @param status 状态
   */
  async updateStatus(id: number, status: UserStatus, requestUser: JwtPayload): Promise<boolean> {
    await this.hasCapability(UserRoleCapability.EditUsers, requestUser);

    return await this.models.Users.update(
      { status },
      {
        where: {
          id,
        },
      },
    ).then(([count]) => count > 0);
  }

  /**
   * 删除用户
   * Super Admin 无法删除，抛出 ForbiddenError 错误
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access capabilities: [DeleteUsers]
   * @param id User Id
   */
  async delete(id: number, requestUser: JwtPayload): Promise<boolean> {
    await this.hasCapability(UserRoleCapability.DeleteUsers, requestUser);

    if (await this.isSupurAdmin(id)) {
      throw new ForbiddenError('Can not delete "Super Admin"!');
    }

    const t = await this.sequelize.transaction();
    try {
      await this.models.UserMeta.destroy({
        where: { userId: id },
        transaction: t,
      });
      await this.models.Users.destroy({
        where: { id },
        transaction: t,
      });

      await t.commit();
      return true;
    } catch (err) {
      this.logger.error(`An error occurred during deleting user (id:${id}), Error: ${err.message}`);
      await t.rollback();
      return false;
    }
  }

  /** -----Authorization----- */

  private genNewScrect(userId: number) {
    // '[userId]_[uuid]_[config.jwt-screct]'
    return md5(`${userId}_${uuid()}_${this.config.get('jwt_screct')}`);
  }

  /**
   * 获取验证 token 的screct
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param userId User id
   * @param refreshToken 获取 refresh token 的 screct
   */
  async getTokenScrect(userId: number, refreshToken: boolean = false): Promise<string> {
    const screctMetaKey = refreshToken ? `${this.tablePrefix}refresh_token_screct` : `${this.tablePrefix}screct`;
    const screctMeta = await this.models.UserMeta.findOne({
      attributes: ['metaValue'],
      where: {
        userId,
        metaKey: screctMetaKey,
      },
    });
    let screct: string;
    if (screctMeta) {
      screct = screctMeta.metaValue;
    } else {
      // 数据库的screct丢失,将重新生成一个新的
      const newScrect = this.genNewScrect(userId);
      await this.models.UserMeta.create({
        userId,
        metaKey: screctMetaKey,
        metaValue: newScrect,
        private: 'yes',
      });
      screct = newScrect;
    }
    return screct;
  }

  /**
   * 修改 token 的 screct
   * 在登出，修改密码，忘记密码等场景中更新 screct 重置 access/refresh token
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param userId User id
   * @param refreshToken 修改 refresh token 的 screct
   */
  async updateTokenScrect(userId: number, refreshToken: boolean = false) {
    const newScrect = this.genNewScrect(userId);
    await this.models.UserMeta.update(
      {
        metaValue: newScrect,
      },
      {
        where: {
          userId,
          metaKey: refreshToken ? `${this.tablePrefix}refresh_token_screct` : `${this.tablePrefix}screct`,
        },
      },
    );
    return newScrect;
  }

  /**
   * 获取用户角色
   * @param userId User id
   */
  async getRole(userId: number): Promise<UserRole | null> {
    // 角色
    const role = await this.models.UserMeta.findOne({
      attributes: ['metaValue'],
      where: {
        userId,
        metaKey: `${this.tablePrefix}${UserMetaTablePrefixKeys.UserRole}`,
      },
    });
    return role?.metaValue as UserRole;
  }

  /**
   * 登录
   * 成功则返回token，否则返回 false
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param loginName 登录名/邮箱/手机号码
   * @param loginPwd 登录密码
   */
  async verifyUser(loginName: string, loginPwd: string): Promise<JwtPayload | null> {
    const user = await this.models.Users.findOne({
      attributes: ['id', 'loginName', 'createdAt'],
      where: {
        [this.Op.or]: [{ loginName }, { email: loginName }, { mobile: loginName }],
        loginPwd: md5(loginPwd),
        status: UserStatus.Enable,
      },
    });

    if (user) {
      // 角色
      const role = await this.getRole(user.id);

      return {
        ...user.toJSON(),
        role,
      } as JwtPayload;
    }
    return null;
  }

  /**
   * 修改密码
   * 旧密码不正确返回 false
   * @param userId User id
   * @param oldPwd 旧密码
   * @param newPwd 新密码
   * @returns
   */
  async updateLoginPwd(userId: number, oldPwd: string, newPwd: string): Promise<boolean> {
    const user = await this.models.Users.findOne({
      where: {
        id: userId,
        loginPwd: md5(oldPwd),
      },
    });

    // 旧密码可以找到用户
    if (user) {
      user.loginPwd = newPwd;
      await user.save();
      return true;
    }
    return false;
  }
}
