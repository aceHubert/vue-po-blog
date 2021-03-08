import { Model, DataTypes, Optional } from 'sequelize';

export interface PostMetaAttributes {
  id: number;
  postId: number;
  metaKey: string;
  metaValue: string;
  private: 'yes' | 'no';
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PostMetaCreationAttributes extends Optional<PostMetaAttributes, 'id' | 'private'> {}

export default class PostMeta extends Model<PostMetaAttributes, PostMetaCreationAttributes> {
  public id!: number;
  public postId!: number;
  public metaKey!: string;
  public metaValue!: string;
  public private!: string;
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
        comment: '文章ID',
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
      tableName: `${prefix}postmeta`,
      indexes: [
        { name: 'post_id', fields: ['post_id'] },
        { name: 'meta_key', fields: ['meta_key'] },
      ],
      createdAt: false,
      updatedAt: false,
      comment: '文章扩展表',
    },
  );
};
