import { Model, DataTypes, Optional } from 'sequelize';

export interface MediaMetaAttributes {
  id: number;
  mediaId: number;
  metaKey: string;
  metaValue: string;
  private: 'yes' | 'no';
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MediaMetaCreationAttributes extends Optional<MediaMetaAttributes, 'id' | 'private'> {}

export default class MediaMeta extends Model<MediaMetaAttributes, MediaMetaCreationAttributes> {
  public id!: number;
  public mediaId!: number;
  public metaKey!: string;
  public metaValue!: string;
  public private!: string;
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
        allowNull: false,
        comment: '元数据Value',
      },
      private: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'no',
        comment: '私有 Meta 不可返回给前端, yes：是；no：否; ',
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
