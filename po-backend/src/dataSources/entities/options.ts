import { Model, DataTypes, Optional } from 'sequelize';
import { OptionAutoload } from '../helper/enums';

export interface OptionAttributes {
  id: number;
  optionName: string;
  optionValue: string;
  autoload: OptionAutoload;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OptionCreationAttributes extends Optional<OptionAttributes, 'id' | 'autoload'> {}

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
        comment: '配置名称',
      },
      optionValue: {
        type: new DataTypes.TEXT('long'),
        allowNull: false,
        comment: '配置值',
      },
      autoload: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'yes',
        comment: '是否自动加载, yes：是；no：否;',
      },
    },
    {
      sequelize,
      tableName: `${prefix}options`,
      indexes: [{ name: 'autoload', fields: ['autoload'] }],
      createdAt: false,
      updatedAt: false,
      comment: '配置表',
    },
  );
};
