import { Model, DataTypes } from 'sequelize';
import { MediaMetaAttributes, MediaMetaCreationAttributes } from '@/orm-entities/interfaces/media-meta.interface';
import { TableInitFunc } from '../interfaces/table-init-func.interface';

export default class MediaMeta extends Model<MediaMetaAttributes, MediaMetaCreationAttributes> {
  public id!: number;
  public mediaId!: number;
  public metaKey!: string;
  public metaValue!: string;
}

export const init: TableInitFunc = function init(sequelize, { prefix }) {
  MediaMeta.init(
    {
      id: {
        type: DataTypes.BIGINT({ unsigned: true }),
        autoIncrement: true,
        primaryKey: true,
      },
      mediaId: {
        type: DataTypes.BIGINT({ unsigned: true }),
        allowNull: false,
        defaultValue: 0,
        comment: '媒体ID',
      },
      metaKey: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '元数据Key',
      },
      metaValue: {
        type: new DataTypes.TEXT('long'),
        comment: '元数据Value',
      },
    },
    {
      sequelize,
      tableName: `${prefix}mediameta`,
      indexes: [
        { name: 'media_id', fields: ['media_id'] },
        { name: 'meta_key', fields: ['meta_key'] },
      ],
      createdAt: false,
      updatedAt: false,
      comment: '媒体扩展表',
    },
  );
};
