import { registerEnumType } from 'type-graphql';
import { upperCase } from 'lodash';
import * as Enums from '@/dataSources/helper/enums';

export const enumsRegister = () => {
  Object.keys(Enums).map((key) => {
    registerEnumType((Enums as any)[key], {
      name: upperCase(key).replace(/ /g, '_'),
      description: key,
    });
  });
};
