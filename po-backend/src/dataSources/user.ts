import md5 from 'md5';
import { configs } from '@/utils/getConfig';
import { UserStatus } from '@/model/enums';
import { MetaDataSource } from './meta';

// Types
import User, {
  PagedUserQueryArgs,
  PagedUser,
  UserAddModel,
  UserUpdateModel,
  UserLoginModel,
  UserMetaAddModel,
} from '@/model/user';
import { UserCreationAttributes } from './entities/users';
import UserMeta, { UserMetaCreationAttributes } from './entities/userMeta';

export default class UserDataSource extends MetaDataSource<UserMeta, UserMetaAddModel> {
  /**
   * 根据 Id 获取用户
   * @param id 用户Id
   * @param fields 返回的字段
   */
  get(id: number, fields: string[]): Promise<User | null> {
    return this.models.Users.findByPk(id, {
      attributes: this.filterFields(fields, this.models.Users),
    });
  }

  /**
   * 获取用户分页列表
   * @param query 分页 Query 参数
   * @param fields 返回的字段
   */
  getPaged({ offset, limit, ...query }: PagedUserQueryArgs, fields: string[]): Promise<PagedUser> {
    return this.models.Users.findAndCountAll({
      attributes: this.filterFields(fields, this.models.Users),
      where: {
        ...query,
      },
      offset,
      limit,
      order: [['created_at', 'DESC']],
    }).then(({ rows, count: total }) => ({
      rows,
      total,
    }));
  }

  /**
   * 判断登录名是否在在
   * @param loginName 登录名
   */
  async isExists(loginName: string): Promise<boolean> {
    return (
      (await this.models.Users.count({
        where: {
          loginName,
        },
      })) > 0
    );
  }

  /**
   * 添加用户（如果登录名已经存在，则返回 null）
   * @param model 添加实体模型
   * @param fields 返回的字段
   */
  async create(model: UserAddModel): Promise<User | false> {
    const isExists = await this.isExists(model.loginName);

    if (!isExists) {
      const { loginName, loginPwd, niceName, displayName, metas, ...rest } = model;
      const creationModel: UserCreationAttributes = {
        ...rest,
        loginName,
        loginPwd,
        niceName: niceName || loginName,
        displayName: displayName || loginName,
      };

      const user = await this.models.Users.create(creationModel);

      if (metas && metas.length) {
        const metaCreationModels: UserMetaCreationAttributes[] = metas.map((meta) => {
          return {
            ...meta,
            userId: user.id,
          };
        });
        this.models.UserMeta.bulkCreate(metaCreationModels);
      }

      return user;
    }
    return false;
  }

  /**
   * 登录（成功则返回用户实体，否则返回 false）
   * @param model 登录实体
   */
  async login(model: UserLoginModel): Promise<false | JwtPayload> {
    const user = await this.models.Users.findOne({
      attributes: ['id', 'mobile', 'email'], // todo: 返回必须字段
      where: {
        loginName: model.loginName,
        loginPwd: md5(model.loginPwd),
        status: UserStatus.Enable,
      },
    });

    if (user) {
      const role = await this.models.UserMeta.findOne({
        attributes: ['metaValue'],
        where: {
          userId: user.id,
          metaKey: `${configs.get('table_prefix')}role`,
        },
      });
      return {
        ...user.toJSON(),
        role: role ? role.metaValue : 'User',
      } as JwtPayload;
    } else {
      return false;
    }
  }

  /**
   * 修改用户
   * @param id User Id
   * @param model 修改实体模型
   */
  update(id: number, model: UserUpdateModel) {
    return this.models.Users.update(model, {
      where: {
        id,
      },
    }).then(([count]) => count > 0);
  }

  /**
   * 修改用户状态
   * @param id Id
   * @param status 状态
   */
  updateStatus(id: number, status: UserStatus): Promise<boolean> {
    return this.models.Users.update(
      { status },
      {
        where: {
          id,
        },
      },
    ).then(([count]) => count > 0);
  }
}
