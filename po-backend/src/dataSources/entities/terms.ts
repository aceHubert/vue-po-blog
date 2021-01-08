import { Model, DataTypes, Optional } from 'sequelize';

export interface TermAttributes {
  id: number;
  name: string;
  slug: string;
  group: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TermCreationAttributes extends Optional<TermAttributes, 'id' | 'group'> {}

export default class Terms extends Model<TermAttributes, TermCreationAttributes> {
  public id!: number;
  public name!: string;
  public slug!: string;
  public group!: number;
}

export const init: TableInitFn = function init(sequelize, { prefix }) {
  Terms.init(
    {
      id: {
        type: DataTypes.BIGINT({ unsigned: true }),
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '名称',
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '别名',
      },
      group: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
        comment: '组',
      },
    },
    {
      sequelize,
      tableName: `${prefix}terms`,
      indexes: [
        { name: 'name', fields: ['name'] },
        { name: 'slug', fields: ['slug'] },
      ],
      createdAt: false,
      updatedAt: false,
      comment: '协议表',
    },
  );
};
