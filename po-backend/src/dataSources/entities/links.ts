import { Model, DataTypes, Optional } from 'sequelize';
import { LinkTarget, LinkVisible } from '../../model/enums';

export interface LinkAttributes {
  id: number;
  url: string;
  name: string;
  image: string;
  target: LinkTarget;
  description: string;
  visible: LinkVisible;
  userId: number;
  rel: string;
  rss: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LinkCreationAttributes extends Optional<LinkAttributes, 'id' | 'visible' | 'userId' | 'rel' | 'rss'> {}

export default class Links extends Model<LinkAttributes, LinkCreationAttributes> {
  public id!: number;
  public url!: string;
  public name!: string;
  public image!: string;
  public target!: LinkTarget;
  public description!: string;
  public visible!: LinkVisible;
  public userId!: number;
  public rel?: string;
  public rss?: string;
}

export const init: TableInitFn = function init(sequelize, { prefix }) {
  Links.init(
    {
      id: {
        type: DataTypes.BIGINT({ unsigned: true }),
        autoIncrement: true,
        primaryKey: true,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '地址',
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '名称',
      },
      image: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '图片',
      },
      target: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: '打开方式,values:[_blank,_self]',
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '说明',
      },
      visible: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'yes',
        comment: '是否可见，yes：是；no：否；',
      },
      userId: {
        type: DataTypes.BIGINT({ unsigned: true }),
        allowNull: false,
        defaultValue: 1,
        comment: '用户ID',
      },
      rel: {
        type: DataTypes.STRING,
        comment: 'rel',
      },
      rss: {
        type: DataTypes.STRING,
        comment: 'rss',
      },
    },
    {
      sequelize,
      tableName: `${prefix}links`,
      indexes: [
        { name: 'target', fields: ['target'] },
        { name: 'visible', fields: ['visible'] },
        { name: 'user_id', fields: ['user_id'] },
      ],
      comment: '外部链接表',
    },
  );
};
