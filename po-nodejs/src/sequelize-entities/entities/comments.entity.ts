import { Model, DataTypes } from 'sequelize';
import { CommentType } from '@/comments/enums';
import { CommentAttributes, CommentCreationAttributes } from '@/orm-entities/interfaces/comments.interface';
import { TableInitFunc } from '../interfaces/table-init-func.interface';
import { TableAssociateFunc } from '../interfaces/table-associate-func.interface';

export default class Comments extends Model<
  Omit<CommentAttributes, 'updatedAt' | 'createdAt'>,
  Omit<CommentCreationAttributes, 'updatedAt' | 'createdAt'>
> {
  public id!: number;
  public postId!: number;
  public author!: string;
  public authorEmail?: string;
  public authorUrl?: string;
  public authorIp?: string;
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
        comment: 'Post id',
      },
      author: {
        type: new DataTypes.TEXT('tiny'),
        allowNull: false,
        comment: 'Author name',
      },
      authorEmail: {
        type: DataTypes.STRING(100),
        comment: "Author's email",
      },
      authorUrl: {
        type: DataTypes.STRING(200),
        field: 'author_URL',
        comment: "Author's client URL address",
      },
      authorIp: {
        type: DataTypes.STRING(100),
        field: 'author_IP',
        comment: "Author's client IP address",
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Comment content',
      },
      approved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Is approved',
      },
      edited: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Is edited',
      },
      type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'comment',
        comment: 'Type (for future, default: "comment")',
      },
      agent: {
        type: DataTypes.STRING,
        comment: 'Client UserAgent',
      },
      parentId: {
        type: DataTypes.BIGINT({ unsigned: true }),
        allowNull: false,
        defaultValue: 0,
        comment: 'Parent id',
      },
      userId: {
        type: DataTypes.BIGINT({ unsigned: true }),
        allowNull: false,
        defaultValue: 0,
        comment: 'User id',
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
      comment: 'Comments',
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
