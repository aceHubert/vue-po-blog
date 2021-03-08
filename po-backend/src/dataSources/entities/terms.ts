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

export const init: TableInitFunc = function init(sequelize, { prefix }) {
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

// 关联
export const associate: TableAssociateFunc = function associate(models) {
  // Terms.id <--> TermMeta.termId
  models.Terms.hasMany(models.TermMeta, {
    foreignKey: 'termId',
    sourceKey: 'id',
    as: 'TermMetas',
    constraints: false,
  });
  models.TermMeta.belongsTo(models.Terms, { foreignKey: 'termId', targetKey: 'id', constraints: false });

  // Terms.id <--> TermTaxonomy.termId
  models.Terms.hasOne(models.TermTaxonomy, {
    foreignKey: 'termId',
    sourceKey: 'id',
    constraints: false,
  });
  models.TermTaxonomy.belongsTo(models.Terms, { foreignKey: 'termId', targetKey: 'id', constraints: false });
};
