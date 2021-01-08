import { Model, DataTypes, Optional } from 'sequelize';
import md5 from 'md5';
import { UserStatus } from '../../model/enums';

export interface UserAttributes {
  id: number;
  loginName: string;
  loginPwd: string;
  niceName: string;
  displayName: string;
  mobile: string | null;
  email: string;
  url: string;
  status: UserStatus;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UserCreationAttributes
  extends Optional<UserAttributes, 'id' | 'niceName' | 'displayName' | 'mobile' | 'status'> {}

export default class Users extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public loginName!: string;
  public loginPwd!: string;
  public niceName!: string;
  public displayName!: string;
  public mobile!: string | null;
  public email!: string;
  public url!: string;
  public status!: UserStatus;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const init: TableInitFn = function init(sequelize, { prefix }) {
  Users.init(
    {
      id: {
        type: DataTypes.BIGINT({ unsigned: true }),
        autoIncrement: true,
        primaryKey: true,
      },
      loginName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: '登录账号',
      },
      loginPwd: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value: string) {
          this.setDataValue('loginPwd', md5(value));
        },
        comment: '登录密码',
      },
      niceName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '用户昵称',
      },
      displayName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '来前台显示出来的用户名字',
      },
      mobile: {
        type: DataTypes.STRING(50),
        unique: true,
        comment: '手机号码',
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: '邮箱',
      },
      url: {
        type: DataTypes.STRING(200),
        comment: '客户端URL',
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: '用户状态，0：禁用；1：启用',
      },
    },
    {
      sequelize,
      tableName: `${prefix}users`,
      indexes: [{ name: 'nice_name', fields: ['nice_name'] }],
      comment: '用户表',
    },
  );
};
