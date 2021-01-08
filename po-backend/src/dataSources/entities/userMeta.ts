import { Model, DataTypes, Optional } from 'sequelize';

export interface UserMetaAttributes {
  id: number;
  userId: number;
  metaKey: string;
  metaValue: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UserMetaCreationAttributes extends Optional<UserMetaAttributes, 'id'> {}

export default class UserMeta extends Model<UserMetaAttributes, UserMetaCreationAttributes> {
  public id!: number;
  public userId!: number;
  public metaKey!: string;
  public metaValue!: string;
}

export const init: TableInitFn = function init(sequelize, { prefix }) {
  UserMeta.init(
    {
      id: {
        type: DataTypes.BIGINT({ unsigned: true }),
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.BIGINT({ unsigned: true }),
        allowNull: false,
        defaultValue: 0,
        comment: '用户ID',
      },
      metaKey: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '元数据Key',
      },
      metaValue: {
        type: new DataTypes.TEXT('long'),
        allowNull: false,
        comment: '元数据Value',
      },
    },
    {
      sequelize,
      tableName: `${prefix}usermeta`,
      indexes: [
        { name: 'user_id', fields: ['user_id'] },
        { name: 'meta_key', fields: ['meta_key'] },
      ],
      createdAt: false,
      updatedAt: false,
      comment: '用户扩展表',
    },
  );
};
