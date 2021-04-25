import { Model, DataTypes } from 'sequelize';
import { PostMetaAttributes, PostMetaCreationAttributes } from '@/orm-entities/interfaces/post-meta.interface';
import { TableInitFunc } from '../interfaces/table-init-func.interface';

export default class PostMeta extends Model<PostMetaAttributes, PostMetaCreationAttributes> {
  public id!: number;
  public postId!: number;
  public metaKey!: string;
  public metaValue?: string;
}

export const init: TableInitFunc = function init(sequelize, { prefix }) {
  PostMeta.init(
    {
      id: {
        type: DataTypes.BIGINT({ unsigned: true }),
        autoIncrement: true,
        primaryKey: true,
      },
      postId: {
        type: DataTypes.BIGINT({ unsigned: true }),
        allowNull: false,
        defaultValue: 0,
        comment: 'Post id',
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
      tableName: `${prefix}postmeta`,
      indexes: [
        { name: 'post_id', fields: ['post_id'] },
        { name: 'meta_key', fields: ['meta_key'] },
      ],
      createdAt: false,
      updatedAt: false,
      comment: 'Post metas',
    },
  );
};
