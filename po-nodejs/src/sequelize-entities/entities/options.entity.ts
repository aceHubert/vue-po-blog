import { Model, DataTypes } from 'sequelize';
import { OptionAutoload } from '@/options/enums';
import { OptionAttributes, OptionCreationAttributes } from '@/orm-entities/interfaces/options.interface';
import { TableInitFunc } from '../interfaces/table-init-func.interface';

export default class Options extends Model<OptionAttributes, OptionCreationAttributes> {
  public id!: number;
  public optionName!: string;
  public optionValue!: string;
  public autoload!: OptionAutoload;
}

export const init: TableInitFunc = function init(sequelize, { prefix }) {
  Options.init(
    {
      id: {
        type: DataTypes.BIGINT({ unsigned: true }),
        autoIncrement: true,
        primaryKey: true,
      },
      optionName: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        comment: 'Opiton name',
      },
      optionValue: {
        type: new DataTypes.TEXT('long'),
        allowNull: false,
        comment: 'Option value',
      },
      autoload: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'yes',
        comment: 'Autoload ("yes" or "no", default: "yes")',
      },
    },
    {
      sequelize,
      tableName: `${prefix}options`,
      indexes: [{ name: 'autoload', fields: ['autoload'] }],
      createdAt: false,
      updatedAt: false,
      comment: 'Options',
    },
  );
};
