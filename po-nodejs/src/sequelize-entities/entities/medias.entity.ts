import { Model, DataTypes } from 'sequelize';
import { MediaAttributes, MediaCreationAttributes } from '@/orm-entities/interfaces/medias.interface';
import { TableInitFunc } from '../interfaces/table-init-func.interface';
import { TableAssociateFunc } from '../interfaces/table-associate-func.interface';

export default class Medias extends Model<
  Omit<MediaAttributes, 'createdAt'>,
  Omit<MediaCreationAttributes, 'createdAt'>
> {
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

export const init: TableInitFunc = function init(sequelize, { prefix }) {
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

// 关联
export const associate: TableAssociateFunc = function associate(models) {
  // Medias.id <--> MediaMeta.mediaId
  models.Medias.hasMany(models.MediaMeta, {
    foreignKey: 'mediaId',
    sourceKey: 'id',
    as: 'MediaMetas',
    constraints: false,
  });
  models.MediaMeta.belongsTo(models.Medias, { foreignKey: 'mediaId', targetKey: 'id', constraints: false });
};
