import { Model, DataTypes } from 'sequelize';
import { PostStatus, PostCommentStatus } from '@/posts/enums';
import {
  PostAttributes,
  PostCreationAttributes,
  PostType,
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
        comment: 'Name (display at the URL address, must be unique)',
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Title',
      },
      author: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: 'Author id',
      },
      content: {
        type: new DataTypes.TEXT('long'),
        allowNull: false,
        comment: 'Content',
      },
      excerpt: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'excerpt',
      },
      type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'post',
        comment: 'Type ("post", "page", ect...)',
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'publish',
        comment: 'Post status ("draft", "publish", ect.... default: "publish")',
      },
      order: {
        type: DataTypes.BIGINT(),
        allowNull: false,
        defaultValue: 0,
        comment: 'Sort (default: 0)',
      },
      parentId: {
        type: DataTypes.BIGINT({ unsigned: true }),
        allowNull: false,
        defaultValue: 0,
        comment: 'Parent id',
      },
      commentStatus: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'open',
        comment: 'Comment status, ("open" or "close", default: "open")',
      },
      commentCount: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
        comment: 'Comment count',
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
      comment: 'Posts',
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
