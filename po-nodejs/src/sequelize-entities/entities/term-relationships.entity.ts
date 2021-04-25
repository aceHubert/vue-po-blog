import { Model, DataTypes } from 'sequelize';
import {
  TermRelationshipAttributes,
  TermRelationshipCreationAttributes,
} from '@/orm-entities/interfaces/term-relationships.interface';
import { TableInitFunc } from '../interfaces/table-init-func.interface';

export default class TermRelationships extends Model<TermRelationshipAttributes, TermRelationshipCreationAttributes> {
  public objectId!: number;
  public taxonomyId!: number;
  public order!: number;
}

export const init: TableInitFunc = function init(sequelize, { prefix }) {
  TermRelationships.init(
    {
      objectId: {
        type: DataTypes.BIGINT({ unsigned: true }),
        allowNull: false,
        primaryKey: true,
        comment: 'Object id (Post, Link, ect...)',
      },
      taxonomyId: {
        type: DataTypes.BIGINT({ unsigned: true }),
        allowNull: false,
        primaryKey: true,
        comment: 'Taxonomy id',
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Sort (default: 0)',
      },
    },
    {
      sequelize,
      tableName: `${prefix}term_relationships`,
      indexes: [{ name: 'taxonomy_id', fields: ['taxonomy_id'] }],
      createdAt: false,
      updatedAt: false,
      comment: 'Term relationships',
    },
  );
};
