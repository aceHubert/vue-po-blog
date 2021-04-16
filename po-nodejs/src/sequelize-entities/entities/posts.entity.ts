import { Model, DataTypes } from 'sequelize';
import {
  PostAttributes,
  PostCreationAttributes,
  PostType,
  PostStatus,
  PostCommentStatus,
  PostOperateType,
  PostOperateStatus,
} from '@/orm-entities/interfaces/posts.interface';
import { TableInitFunc } from '../interfaces/table-init-func.interface';
import { TableAssociateFunc } from '../interfaces/table-associate-func.interface';

export default class Posts extends Model<
  Omit<PostAttributes, 'updatedAt' | 'createdAt'>,
  Omit<PostCreationAttributes, 'updatedAt' | 'createdAt'>
> {
  public id!: number;
  public title!: string;
  public name!: string;
  public author!: number;
  public content!: string;
  public excerpt!: string;
  public type!: PostType | PostOperateType;
  public status!: PostStatus | PostOperateStatus;
  public order!: number;
  public parent?: number;
  public commentStatus!: PostCommentStatus;
  public commentCount!: number;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const init: TableInitFunc = function init(sequelize, { prefix }) {
  Posts.init(
    {
      id: {
        type: DataTypes.BIGINT({ unsigned: true }),
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '唯一名称，用于URL地址',
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '标题',
      },
      author: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: '作者',
      },
      content: {
        type: new DataTypes.TEXT('long'),
        allowNull: false,
        comment: '内容',
      },
      excerpt: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '摘要',
      },
      type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'post',
        comment: '类型，如 post：文章；page：页面；等',
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'publish',
        comment: '状态，如 draft：草稿；publish：发布；等',
      },
      order: {
        type: DataTypes.BIGINT(),
        allowNull: false,
        defaultValue: 0,
        comment: '排序',
      },
      parent: {
        type: DataTypes.BIGINT({ unsigned: true }),
        comment: '父 Id',
      },
      commentStatus: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'open',
        comment: '评论状态，open：启用；close：禁用；',
      },
      commentCount: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
        comment: '评论数量',
      },
    },
    {
      sequelize,
      tableName: `${prefix}posts`,
      indexes: [
        { name: 'author', fields: ['author'] },
        { name: 'type', fields: ['type'] },
        { name: 'status', fields: ['status'] },
        { name: 'comment_status', fields: ['comment_status'] },
      ],
      comment: '文章表',
    },
  );
};

// 关联
export const associate: TableAssociateFunc = function associate(models) {
  // Posts.id <--> PostMeta.postId
  models.Posts.hasMany(models.PostMeta, {
    foreignKey: 'postId',
    sourceKey: 'id',
    as: 'PostMetas',
    constraints: false,
  });
  models.PostMeta.belongsTo(models.Posts, { foreignKey: 'postId', targetKey: 'id', constraints: false });

  // Posts.id --> TermRelationships.objectId
  models.Posts.hasMany(models.TermRelationships, {
    foreignKey: 'objectId',
    sourceKey: 'id',
    constraints: false,
  });
};
