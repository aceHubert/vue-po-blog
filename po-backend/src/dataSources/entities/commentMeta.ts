import { Model, DataTypes, Optional } from 'sequelize';

export interface CommentMetaAttributes {
  id: number;
  commentId: number;
  metaKey: string;
  metaValue: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CommentMetaCreationAttributes extends Optional<CommentMetaAttributes, 'id'> {}

export default class CommentMeta extends Model<CommentMetaAttributes, CommentMetaCreationAttributes> {
  public id!: number;
  public commentId!: number;
  public metaKey!: string;
  public metaValue!: string;
}

export const init: TableInitFn = function init(sequelize, { prefix }) {
  CommentMeta.init(
    {
      id: {
        type: DataTypes.BIGINT({ unsigned: true }),
        autoIncrement: true,
        primaryKey: true,
      },
      commentId: {
        type: DataTypes.BIGINT({ unsigned: true }),
        allowNull: false,
        defaultValue: 0,
        comment: '评论ID',
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
      tableName: `${prefix}commentmeta`,
      indexes: [
        { name: 'comment_id', fields: ['comment_id'] },
        { name: 'meta_key', fields: ['meta_key'] },
      ],
      createdAt: false,
      updatedAt: false,
      comment: '评论扩展表',
    },
  );
};
