import { UserRoleCapabilities, UserRoleWithNone, UserStatus } from './helper/enums';
import { MetaDataSource } from './meta';

// Types
import { WhereOptions } from 'sequelize';
import User, {
  PagedUserQueryArgs,
  UserWithRole,
  PagedUser,
  UserAddModel,
  UserUpdateModel,
  UserMetaAddModel,
} from '@/model/user';
import UserMeta from './entities/userMeta';
import { ValidationError } from 'apollo-server-express';
import { UserAttributes } from './entities/users';

export default class UserDataSource extends MetaDataSource<UserMeta, UserMetaAddModel> {
  /**
   * 根据 Id 获取用户
   * 通过 id 获取用户必须要有EditUsers权限
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access Authorized, capabilities: [EditUsers]
   * @param id 用户Id
   * @param fields 返回的字段
   */
  async get(id: number | null, fields: string[]): Promise<User | null> {
    this.isAuthorized();

    if (id) {
      this.hasCapability(UserRoleCapabilities.EditUsers);
    } else {
      id = this.content.user!.id;
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
  async getPaged({ offset, limit, ...query }: PagedUserQueryArgs, fields: string[]): Promise<PagedUser> {
    this.isAuthorized();
    this.hasCapability(UserRoleCapabilities.ListUsers);

    const where: WhereOptions<UserAttributes> = {};
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
        where['$UserMetas.meta_value$' as keyof UserAttributes] = {
          [this.Op.is]: null,
        };
      } else {
        where[`$UserMetas.${this.field('metaValue', this.models.UserMeta)}$` as keyof UserAttributes] = query.role;
      }
    } else {
      where['$UserMetas.meta_value$' as keyof UserAttributes] = {
        [this.Op.not]: null,
      };
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
  async create(model: UserAddModel): Promise<User> {
    this.isAuthorized();
    this.hasCapability(UserRoleCapabilities.CreateUsers);

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
  async update(id: number, model: UserUpdateModel): Promise<boolean> {
    this.isAuthorized();
    this.hasCapability(UserRoleCapabilities.EditUsers);

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
   * @param id Id
   * @param status 状态
   */
  async updateStatus(id: number, status: UserStatus): Promise<boolean> {
    this.isAuthorized();
    this.hasCapability(UserRoleCapabilities.EditUsers);

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
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access Authorized, capabilities: [DeleteUsers]
   * @param id User Id
   */
  async delete(id: number) {
    this.isAuthorized();
    this.hasCapability(UserRoleCapabilities.DeleteUsers);

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
}
