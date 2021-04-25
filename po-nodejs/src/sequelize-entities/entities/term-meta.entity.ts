import { Model, DataTypes } from 'sequelize';
import { TermMetaAttributes, TermMetaCreationAttributes } from '@/orm-entities/interfaces/term-meta.interface';
import { TableInitFunc } from '../interfaces/table-init-func.interface';

export default class TermMeta extends Model<TermMetaAttributes, TermMetaCreationAttributes> {
  public id!: number;
  public termId!: number;
  public metaKey!: string;
  public metaValue?: string;
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
        comment: 'Term id',
      },
      metaKey: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Meta key',
      },
      metaValue: {
        type: new DataTypes.TEXT('long'),
        comment: 'Meta value',
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
      comment: 'Term metas',
    },
  );
};
