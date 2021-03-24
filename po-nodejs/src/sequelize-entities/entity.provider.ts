import { EntityModuleOptions } from './interfaces';
import { SEQUELIZE_ENTITY_OPTIONS } from './constants';

export function createEntityProvider(config: EntityModuleOptions): any[] {
  return [{ provide: SEQUELIZE_ENTITY_OPTIONS, useValue: config || {} }];
}
