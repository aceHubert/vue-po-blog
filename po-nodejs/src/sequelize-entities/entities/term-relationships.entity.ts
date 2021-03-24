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
        comment: '对象ID',
      },
      taxonomyId: {
        type: DataTypes.BIGINT({ unsigned: true }),
        allowNull: false,
        primaryKey: true,
        comment: '分类ID',
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '排序',
      },
    },
    {
      sequelize,
      tableName: `${prefix}term_relationships`,
      indexes: [{ name: 'taxonomy_id', fields: ['taxonomy_id'] }],
      createdAt: false,
      updatedAt: false,
      comment: '协议关系表',
    },
  );
};
