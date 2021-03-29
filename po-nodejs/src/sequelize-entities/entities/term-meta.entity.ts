import { Model, DataTypes } from 'sequelize';
import { TermMetaAttributes, TermMetaCreationAttributes } from '@/orm-entities/interfaces/term-meta.interface';
import { TableInitFunc } from '../interfaces/table-init-func.interface';

export default class TermMeta extends Model<TermMetaAttributes, TermMetaCreationAttributes> {
  public id!: number;
  public termId!: number;
  public metaKey!: string;
  public metaValue!: string;
  public private!: string;
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
