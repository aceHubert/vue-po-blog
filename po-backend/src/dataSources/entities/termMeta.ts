import { Model, DataTypes, Optional } from 'sequelize';

export interface TermMetaAttributes {
  id: number;
  termId: number;
  metaKey: string;
  metaValue: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TermMetaCreationAttributes extends Optional<TermMetaAttributes, 'id'> {}

export default class TermMeta extends Model<TermMetaAttributes, TermMetaCreationAttributes> {
  public id!: number;
  public termId!: number;
  public metaKey?: string;
  public metaValue?: string;
}

export const init: TableInitFn = function init(sequelize, { prefix }) {
  TermMeta.init(
    {
      id: {
        type: DataTypes.BIGINT({ unsigned: true }),
        autoIncrement: true,
        primaryKey: true,
      },
      termId: {
        type: DataTypes.BIGINT({ unsigned: true }),
        allowNull: false,
        defaultValue: 0,
        comment: 'ID',
      },
      metaKey: {
        type: DataTypes.STRING,
        comment: '元数据Key',
      },
      metaValue: {
        type: new DataTypes.TEXT('long'),
        comment: '元数据Value',
      },
    },
    {
      sequelize,
      tableName: `${prefix}termmeta`,
      indexes: [
        { name: 'term_id', fields: ['term_id'] },
        { name: 'meta_key', fields: ['meta_key'] },
      ],
      createdAt: false,
      updatedAt: false,
      comment: '协议扩展表',
    },
  );
};
