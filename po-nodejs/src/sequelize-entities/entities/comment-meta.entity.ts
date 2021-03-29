import { Model, DataTypes } from 'sequelize';
import { CommentMetaAttributes, CommentMetaCreationAttributes } from '@/orm-entities/interfaces/comment-meta.interface';
import { TableInitFunc } from '../interfaces/table-init-func.interface';

export default class CommentMeta extends Model<CommentMetaAttributes, CommentMetaCreationAttributes> {
  public id!: number;
  public commentId!: number;
  public metaKey!: string;
  public metaValue!: string;
  public private!: string;
}

export const init: TableInitFunc = function init(sequelize, { prefix }) {
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
