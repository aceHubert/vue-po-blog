import fs from 'fs';
import path from 'path';
import { Injectable, Inject } from '@nestjs/common';
import { Sequelize, Options } from 'sequelize';
import { Models } from './interfaces/models.interface';
import { TableInitFunc } from './interfaces/table-init-func.interface';
import { TableAssociateFunc } from './interfaces/table-associate-func.interface';
import { EntityModuleOptions } from './interfaces/entity-options.interface';
import { SEQUELIZE_ENTITY_OPTIONS } from './constants';

@Injectable()
export class EntityService {
  sequelize: Sequelize;
  models: Models;

  constructor(@Inject(SEQUELIZE_ENTITY_OPTIONS) config: EntityModuleOptions) {
    const sequelizeOpts: Options = {
      host: config.host,
      port: config.port,
      dialect: config.dialect,
      define: {
        freezeTableName: true,
        underscored: true,
        timestamps: true,
        createdAt: true,
        updatedAt: true,
        charset: config.charset,
        collate: config.collate,
      },
    };

    const sequelize = new Sequelize(config.database, config.username, config.password, sequelizeOpts);

    this.sequelize = sequelize;
    this.models = (function initializer() {
      const models: Partial<Models> = {};
      const associateFuncs: TableAssociateFunc[] = [];

      fs.readdirSync(path.join(__dirname, 'entities')).forEach((file) => {
        const { init, associate, default: model } = require(path.join(__dirname, 'entities', file));
        init &&
          (init as TableInitFunc)(sequelize, {
            prefix: config.tablePrefix || '',
          });
        associate && associateFuncs.push(associate);
        models[model.name as keyof Models] = model;
      });

      associateFuncs.forEach((associate) => {
        associate(models as Models);
      });
      return models as Models;
    })();
  }
}
