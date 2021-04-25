import { Model, DataTypes } from 'sequelize';
import {
  TermTaxonomyAttributes,
  TermTaxonomyCreationAttributes,
} from '@/orm-entities/interfaces/term-taxonomy.interface';
import { TableInitFunc } from '../interfaces/table-init-func.interface';
import { TableAssociateFunc } from '../interfaces/table-associate-func.interface';

export default class TermTaxonomy extends Model<TermTaxonomyAttributes, TermTaxonomyCreationAttributes> {
  public id!: number;
  public termId!: number;
  public taxonomy!: string;
  public description!: string;
  public parentId!: number;
  public count!: number;
}

export const init: TableInitFunc = function init(sequelize, { prefix }) {
  TermTaxonomy.init(
    {
      id: {
        type: DataTypes.BIGINT({ unsigned: true }),
        autoIncrement: true,
        primaryKey: true,
      },
      termId: {
        type: DataTypes.BIGINT({ unsigned: true }),
        allowNull: false,
        unique: true,
        comment: '协议ID',
      },
      taxonomy: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '分类',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '说明',
      },
      parentId: {
        type: DataTypes.BIGINT({ unsigned: true }),
        allowNull: false,
        defaultValue: 0,
        comment: '父ID',
      },
      count: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
        comment: '统计数量',
      },
    },
    {
      sequelize,
      tableName: `${prefix}term_taxonomy`,
      indexes: [
        { name: 'taxonomy', fields: ['taxonomy'] },
        { name: 'parent_id', fields: ['parent_id'] },
      ],
      createdAt: false,
      updatedAt: false,
      comment: '协议分类表',
    },
  );
};

// 关联
export const associate: TableAssociateFunc = function associate(models) {
  // TermTaxonomy.id <--> TermRelationships.taxonomyId
  models.TermTaxonomy.hasMany(models.TermRelationships, {
    foreignKey: 'taxonomyId',
    sourceKey: 'id',
    constraints: false,
  });
  models.TermRelationships.belongsTo(models.TermTaxonomy, {
    foreignKey: 'taxonomyId',
    targetKey: 'id',
    constraints: false,
  });
};
