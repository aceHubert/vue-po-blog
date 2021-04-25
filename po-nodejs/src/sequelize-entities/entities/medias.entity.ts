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
        comment: 'File name',
      },
      originalFileName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Original file name',
      },
      extention: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'File extention',
      },
      mimeType: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'File mime type',
      },
      path: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'File relative path',
      },
      userId: {
        type: DataTypes.BIGINT({ unsigned: true }),
        allowNull: false,
        defaultValue: 0,
        comment: 'User id',
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
      comment: 'Medias',
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
