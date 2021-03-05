import fs from 'fs';
import path from 'path';
import { Sequelize, Options } from 'sequelize';
import { configs } from '@/utils/getConfig';

let sequelize: Sequelize;
const sequelizeOpts: Options = {
  host: configs.get('DB_HOST'),
  dialect: configs.get('DB_DIALECT'),
  define: {
    freezeTableName: true,
    underscored: true,
    timestamps: true,
    createdAt: true,
    updatedAt: true,
    charset: configs.get('DB_CHARSET'),
    collate: configs.get('DB_COLLATE'),
  },
};
const tablePrefix = configs.get('table_prefix');
const useDbVariable = configs.get('use_db_variable');
if (useDbVariable) {
  sequelize = new Sequelize(process.env[useDbVariable] as string, sequelizeOpts);
} else {
  sequelize = new Sequelize(
    configs.get('DB_NAME')!,
    configs.get('DB_USER')!,
    configs.get('DB_PASSWORD')!,
    sequelizeOpts,
  );
}

const models = (function initializer() {
  const models: Partial<Models> = {};
  const basename = path.basename(__filename);

  fs.readdirSync(__dirname)
    .filter((file) => {
      return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.ts';
    })
    .forEach((file) => {
      const { init, associate, default: model } = require(path.join(__dirname, file));
      init &&
        (init as TableInitFunc)(sequelize, {
          prefix: tablePrefix,
        });
      model.associate = associate;
      models[model.name as keyof Models] = model;
    });

  Object.values(models).forEach((model: any) => {
    if (model.associate) {
      model.associate(models);
    }
  });
  return models as Models;
})();

export { sequelize, Sequelize };

export default models;
