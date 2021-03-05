import { Model, DataTypes, Optional } from 'sequelize';

export interface TermMetaAttributes {
  id: number;
  termId: number;
  metaKey: string;
  metaValue: string;
  private: 'yes' | 'no';
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TermMetaCreationAttributes extends Optional<TermMetaAttributes, 'id' | 'private'> {}

export default class TermMeta extends Model<TermMetaAttributes, TermMetaCreationAttributes> {
  public id!: number;
  public termId!: number;
  public metaKey?: string;
  public metaValue?: string;
  public private?: string;
}

export const init: TableInitFunc = function init(sequelize, { prefix }) {
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
        allowNull: false,
        comment: '元数据Key',
      },
      metaValue: {
        type: new DataTypes.TEXT('long'),
        allowNull: false,
        comment: '元数据Value',
      },
      private: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'no',
        comment: '私有 Meta 不可返回给前端, yes：是；no：否; ',
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
