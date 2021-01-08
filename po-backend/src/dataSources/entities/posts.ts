import { Model, DataTypes, Optional } from 'sequelize';
import { PostType, PostStatus, PostCommentStatus } from '@/model/enums';

export interface PostAttributes {
  id: number;
  title: string;
  name: string;
  author: number;
  content: string;
  excerpt: string;
  type: PostType;
  status: PostStatus;
  commentStatus: PostCommentStatus;
  commentCount: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PostCreationAttributes
  extends Optional<
    PostAttributes,
    'id' | 'name' | 'author' | 'excerpt' | 'type' | 'status' | 'commentStatus' | 'commentCount'
  > {}

export default class Posts extends Model<PostAttributes, PostCreationAttributes> {
  public id!: number;
  public title!: string;
  public name!: string;
  public author!: number;
  public content!: string;
  public excerpt!: string;
  public type!: PostType;
  public status!: PostStatus;
  public commentStatus!: PostCommentStatus;
  public commentCount!: number;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const init: TableInitFn = function init(sequelize, { prefix }) {
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
        unique: true,
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
