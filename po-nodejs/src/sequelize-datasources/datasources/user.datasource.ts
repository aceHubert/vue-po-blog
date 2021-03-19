import md5 from 'md5';
import { ModuleRef } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { ForbiddenError } from '@/common/utils/errors.utils';
import { UserRole, UserRoleCapability, UserRoleWithNone, UserStatus } from '@/common/helpers/enums';
import { uuid } from '@/common/utils/uuid.utils';
import { MetaDataSource } from './meta.datasource';

// Types
import { WhereOptions } from 'sequelize';
import { ValidationError } from 'apollo-server-express';
import { PagedUserArgs } from '@/users/dto/paged-user.args';
import { NewUserInput } from '@/users/dto/new-user.input';
import { NewUserMetaInput } from '@/users/dto/new-user-meta.input';
import { UpdateUserInput } from '@/users/dto/update-user.input';
import { UserWithRole, PagedUser } from '@/users/models/user.model';
import User from '@/sequelize-entities/entities/users.entity';
import UserMeta from '@/sequelize-entities/entities/user-meta.entity';

@Injectable()
export class UserDataSource extends MetaDataSource<UserMeta, NewUserMetaInput> {
  constructor(protected readonly moduleRef: ModuleRef) {
    super(moduleRef);
  }

  /**
   * 是否是超级管理员
   * @param loginNameOrId 登录名或User Id
   * @returns boolean
   */
  isSupurAdmin(loginNameOrId: number | string) {
    if (typeof loginNameOrId === 'number') {
      return this.models.Users.count({
        where: {
          loginName: 'admin',
        },
      }).then((count) => count > 0);
    } else {
      return Promise.resolve(loginNameOrId === 'admin');
    }
  }

  /**
   * 根据 Id 获取用户
   * 通过 id 获取用户必须要有EditUsers权限
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access Authorized, capabilities: [EditUsers]
   * @param id User Id
   * @param fields 返回的字段
   */
  async get(id: number | null, fields: string[], requestUser: JwtPayload): Promise<User | null> {
    if (id) {
      await this.hasCapability(UserRoleCapability.EditUsers, requestUser);
    } else {
      id = requestUser.id;
    }

    // 如果要查是否是超级管理员，必须查询 loginName 字段
    if (fields.includes('isSuperAdmin') && !fields.includes('loginName')) {
      fields.push('loginName');
    }

    return this.models.Users.findByPk(id, {
      attributes: this.filterFields(fields, this.models.Users),
    });
  }

  /**
   * 获取用户分页列表
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access Authorized, capabilities: [ListUsers]
   * @param query 分页 Query 参数
   * @param fields 返回的字段
   */
  async getPaged({ offset, limit, ...query }: PagedUserArgs, fields: string[], user: JwtPayload): Promise<PagedUser> {
    await this.hasCapability(UserRoleCapability.ListUsers, user);

    const where: WhereOptions = {};
    if (query.keyword) {
      where['loginName'] = {
        [this.Op.like]: `%${query.keyword}%`,
      };
    }
    if (query.status) {
      where['status'] = query.status;
    }

    if (query.role) {
      if (query.role === UserRoleWithNone.None) {
        where['$UserMetas.meta_value$'] = {
          [this.Op.is]: null,
        };
      } else {
        where[`$UserMetas.${this.field('metaValue', this.models.UserMeta)}$`] = query.role;
      }
    } else {
      where['$UserMetas.meta_value$'] = {
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
            metaKey: `${this.tablePrefix}role`,
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
          role: UserMetas.length ? UserMetas[0].metaValue : UserRoleWithNone.None,
          ...rest,
        } as UserWithRole;
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
        [
          this.Sequelize.fn('ifnull', this.col('metaValue', this.models.UserMeta, 'UserMetas'), UserRoleWithNone.None),
          'role',
        ],
      ],
      include: [
        {
          model: this.models.UserMeta,
          as: 'UserMetas',
          where: {
            metaKey: `${this.tablePrefix}role`,
          },
          required: false,
          duplicating: false,
        },
      ],
      group: 'role',
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
   * @access Authorized, capabilities: [CreateUsers]
   * @param model 添加实体模型
   * @param fields 返回的字段
   */
  async create(model: NewUserInput, requestUser: JwtPayload): Promise<User> {
    await this.hasCapability(UserRoleCapability.CreateUsers, requestUser);

    const isExists =
      (await this.models.Users.count({
        where: {
          [this.Op.or]: {
            loginName: model.loginName,
            mobile: model.mobile,
            email: model.email,
          },
        },
      })) > 0;

    if (isExists) {
      throw new ValidationError('login name, mobile, email are rqiured to be unique!');
    }

    const { loginName, loginPwd, niceName, displayName, role, ...rest } = model;

    const user = await this.models.Users.create({
      ...rest,
      loginName,
      loginPwd,
      niceName: niceName || loginName,
      displayName: displayName || loginName,
    });

    await this.models.UserMeta.bulkCreate([
      {
        userId: user.id,
        metaKey: `${this.tablePrefix}role`,
        metaValue: role,
      },
    ]);

    return user;
  }

  /**
   * 修改用户
   * mobile, emaile 要求必须是唯一，否则会抛出 ValidationError
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access Authorized, capabilities: [EditUsers]
   * @param id User Id
   * @param model 修改实体模型
   */
  async update(id: number, model: UpdateUserInput, requestUser: JwtPayload): Promise<boolean> {
    await this.hasCapability(UserRoleCapability.EditUsers, requestUser);

    const isExists =
      (await this.models.Users.count({
        where: {
          [this.Op.or]: {
            mobile: model.mobile,
            email: model.email,
          },
        },
      })) > 0;

    if (isExists) {
      throw new ValidationError('mobile, email are rqiured to be unique!');
    }

    return await this.models.Users.update(model, {
      where: {
        id,
      },
    }).then(([count]) => count > 0);
  }

  /**
   * 修改用户状态
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access Authorized, capabilities: [EditUsers]
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
   * @access Authorized, capabilities: [DeleteUsers]
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
    } catch {
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
  async getUserRole(userId: number): Promise<UserRole | null> {
    // 角色
    const role = await this.models.UserMeta.findOne({
      attributes: ['metaValue'],
      where: {
        userId,
        metaKey: `${this.tablePrefix}role`,
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
      const role = await this.getUserRole(user.id);

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
