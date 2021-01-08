import { Model, DataTypes, Optional } from 'sequelize';

export interface TermRelationshipAttributes {
  objectId: number;
  taxonomyId: number;
  order: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TermRelationshipCreationAttributes extends Optional<TermRelationshipAttributes, 'order'> {}

export default class TermRelationships extends Model<TermRelationshipAttributes, TermRelationshipCreationAttributes> {
  public objectId!: number;
  public taxonomyId!: number;
  public order!: number;
}

export const init: TableInitFn = function init(sequelize, { prefix }) {
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
