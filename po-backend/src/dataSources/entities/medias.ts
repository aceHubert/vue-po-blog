import { Model, DataTypes, Optional } from 'sequelize';

export interface MediaAttributes {
  id: number;
  fileName: string;
  originalFileName: string;
  extention: string;
  mimeType: string;
  path: string;
  userId: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MediaCreationAttributes extends Optional<MediaAttributes, 'id' | 'userId'> {}

export default class Medias extends Model<MediaAttributes, MediaCreationAttributes> {
  public id!: number;
  public fileName!: string;
  public originalFileName!: string;
  public extention!: string;
  public mimeType!: string;
  public path!: string;
  public userId?: number;

  // timestamps!
  public readonly createdAt!: Date;
}

export const init: TableInitFn = function init(sequelize, { prefix }) {
  Medias.init(
    {
      id: {
        type: DataTypes.BIGINT({ unsigned: true }),
        autoIncrement: true,
        primaryKey: true,
      },
      fileName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '文件名',
      },
      originalFileName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '原始文件名',
      },
      extention: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: '文件后缀',
      },
      mimeType: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: '文件类型',
      },
      path: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '文件相对/绝对路径',
      },
      userId: {
        type: DataTypes.BIGINT({ unsigned: true }),
        allowNull: false,
        defaultValue: 1,
        comment: '用户ID',
      },
    },
    {
      sequelize,
      tableName: `${prefix}medias`,
      indexes: [
        { name: 'extention', fields: ['extention'] },
        { name: 'mime_type', fields: ['mime_type'] },
        { name: 'user_id', fields: ['user_id'] },
      ],
      updatedAt: false,
      comment: '媒体表',
    },
  );
};
