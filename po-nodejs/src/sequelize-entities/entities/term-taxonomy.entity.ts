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
        comment: 'Term id',
      },
      taxonomy: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Taxonomy name',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Description',
      },
      parentId: {
        type: DataTypes.BIGINT({ unsigned: true }),
        allowNull: false,
        defaultValue: 0,
        comment: 'Parent id (default: 0)',
      },
      count: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
        comment: 'Count',
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
      comment: 'Term taxonomies',
    },
  );
};

// 关联
export const associate: TableAssociateFunc = function associate(models) {
  // TermTaxonomy.termId <--> Terms.id
  models.TermTaxonomy.hasOne(models.Terms, {
    foreignKey: 'id',
    sourceKey: 'termId',
    as: 'Terms',
    constraints: false,
  });
  models.Terms.belongsTo(models.TermTaxonomy, { foreignKey: 'id', targetKey: 'termId', constraints: false });

  // TermTaxonomy.id <--> TermRelationships.taxonomyId
  models.TermTaxonomy.hasMany(models.TermRelationships, {
    foreignKey: 'taxonomyId',
    sourceKey: 'id',
    as: 'TermRelationships',
    constraints: false,
  });
  models.TermRelationships.belongsTo(models.TermTaxonomy, {
    foreignKey: 'taxonomyId',
    targetKey: 'id',
    constraints: false,
  });
};
