import { Model, DataTypes, Optional } from 'sequelize';
import { CommentType } from '../helper/enums';

export interface CommentAttributes {
  id: number;
  postId: number;
  author: string;
  authorEmail: string;
  authorUrl: string;
  authorIP: string;
  content: string;
  approved: boolean;
  edited: boolean;
  type: CommentType;
  agent: string;
  parentId: number;
  userId: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CommentCreationAttributes
  extends Optional<
    CommentAttributes,
    'id' | 'authorEmail' | 'authorUrl' | 'authorIP' | 'approved' | 'edited' | 'type' | 'agent' | 'parentId' | 'userId'
  > {}

export default class Comments extends Model<CommentAttributes, CommentCreationAttributes> {
  public id!: number;
  public postId!: number;
  public author!: string;
  public authorEmail?: string;
  public authorUrl?: string;
  public authorIP?: string;
  public content!: string;
  public approved!: boolean;
  public edited!: boolean;
  public type!: CommentType;
  public agent?: string;
  public parentId!: number;
  public userId!: number;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const init: TableInitFunc = function init(sequelize, { prefix }) {
  Comments.init(
    {
      id: {
        type: DataTypes.BIGINT({ unsigned: true }),
        autoIncrement: true,
        primaryKey: true,
      },
      postId: {
        type: DataTypes.BIGINT({ unsigned: true }),
        allowNull: false,
        comment: '文章ID',
      },
      author: {
        type: new DataTypes.TEXT('tiny'),
        allowNull: false,
        comment: '评论者',
      },
      authorEmail: {
        type: DataTypes.STRING(100),
        comment: '评论者邮箱',
      },
      authorUrl: {
        type: DataTypes.STRING(200),
        comment: '评论者客户端URL',
      },
      authorIP: {
        type: DataTypes.STRING(100),
        field: 'author_IP',
        comment: '评论者IP',
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '评论内容',
      },
      approved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否能过审核',
      },
      edited: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否在发布之后被修改',
      },
      type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'comment',
        comment: '扩展字段：类型，默认为"coomment"',
      },
      agent: {
        type: DataTypes.STRING,
        comment: '浏览器 UserAgent',
      },
      parentId: {
        type: DataTypes.BIGINT({ unsigned: true }),
        allowNull: false,
        defaultValue: 0,
        comment: '父ID',
      },
      userId: {
        type: DataTypes.BIGINT({ unsigned: true }),
        allowNull: false,
        defaultValue: 0,
        comment: '用户ID',
      },
    },
    {
      sequelize,
      tableName: `${prefix}comments`,
      indexes: [
        { name: 'post_id', fields: ['post_id'] },
        { name: 'approved', fields: ['approved'] },
        { name: 'parent_id', fields: ['parent_id'] },
        { name: 'user_id', fields: ['user_id'] },
      ],
      comment: '评论表',
    },
  );
};

// 关联
export const associate: TableAssociateFunc = function associate(models) {
  // Users.id <--> UserMeta.userId
  models.Comments.hasMany(models.CommentMeta, {
    foreignKey: 'commentId',
    sourceKey: 'id',
    as: 'CommentMetas',
    constraints: false,
  });
  models.CommentMeta.belongsTo(models.Comments, { foreignKey: 'commentId', targetKey: 'id', constraints: false });
};
