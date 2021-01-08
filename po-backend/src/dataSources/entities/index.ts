import fs from 'fs';
import path from 'path';
import { Sequelize, ModelCtor, Options } from 'sequelize';
import { configs } from '@/utils/getConfig';

import Opitons from './options';
import Users from './users';
import UserMeta from './userMeta';
import Posts from './posts';
import PostMeta from './postMeta';
import Comments from './comments';
import CommentMeta from './commentMeta';
import Medias from './medias';
import MediaMeta from './mediaMeta';
import Links from './links';
import Terms from './terms';
import TermMeta from './termMeta';
import TermTaxonomy from './termTaxonomy';
import TermRelationships from './termRelationships';

export type Models = {
  Options: ModelCtor<Opitons>;
  Users: ModelCtor<Users>;
  UserMeta: ModelCtor<UserMeta>;
  Posts: ModelCtor<Posts>;
  PostMeta: ModelCtor<PostMeta>;
  Comments: ModelCtor<Comments>;
  CommentMeta: ModelCtor<CommentMeta>;
  Medias: ModelCtor<Medias>;
  MediaMeta: ModelCtor<MediaMeta>;
  Links: ModelCtor<Links>;
  Terms: ModelCtor<Terms>;
  TermMeta: ModelCtor<TermMeta>;
  TermTaxonomy: ModelCtor<TermTaxonomy>;
  TermRelationships: ModelCtor<TermRelationships>;
};

const basename = path.basename(__filename);
const models: Partial<Models> = {};
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

fs.readdirSync(__dirname)
  .filter((file) => {
    return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.ts';
  })
  .forEach((file) => {
    const { init, default: model } = require(path.join(__dirname, file));
    init &&
      (init as TableInitFn)(sequelize, {
        prefix: tablePrefix,
      });
    models[model.name as keyof Models] = model;
  });

// Object.keys(models).forEach((modelName) => {
//   if (models[modelName].associate) {
//     models[modelName].associate(models);
//   }
// });

export { sequelize, Sequelize };

export default models;
