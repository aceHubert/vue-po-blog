import { Model, DataTypes } from 'sequelize';
import { TermAttributes, TermCreationAttributes } from '@/orm-entities/interfaces/terms.interface';
import { TableInitFunc } from '../interfaces/table-init-func.interface';
import { TableAssociateFunc } from '../interfaces/table-associate-func.interface';

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
        comment: 'Term name',
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Term slug',
      },
      group: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
        comment: 'Group (default: 0)',
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
      comment: 'Terms',
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
};
