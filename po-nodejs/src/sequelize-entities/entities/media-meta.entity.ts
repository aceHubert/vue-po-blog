import { Model, DataTypes } from 'sequelize';
import { MediaMetaAttributes, MediaMetaCreationAttributes } from '@/orm-entities/interfaces/media-meta.interface';
import { TableInitFunc } from '../interfaces/table-init-func.interface';

export default class MediaMeta extends Model<MediaMetaAttributes, MediaMetaCreationAttributes> {
  public id!: number;
  public mediaId!: number;
  public metaKey!: string;
  public metaValue?: string;
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
        comment: 'Media id',
      },
      metaKey: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Meta key',
      },
      metaValue: {
        type: new DataTypes.TEXT('long'),
        comment: 'Meta value',
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
      comment: 'Media metas',
    },
  );
};
