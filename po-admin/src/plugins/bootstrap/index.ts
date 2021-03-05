import { error as globalError } from '@vue-async/utils';
import { Initializer } from './initializer';
import { PrepareDatas } from './prepareDatas';
import { LoadModules } from './loadModules';

// Types
import { Plugin } from '@nuxt/types';

const plugin: Plugin = async (cxt, inject) => {
  const bootstrapWaterfall: Dictionary<(...params: Parameters<Plugin>) => Promise<boolean | void>> = {
    Initializer,
    PrepareDatas,
    LoadModules,
  };

  for (const name in bootstrapWaterfall) {
    try {
      const result = await bootstrapWaterfall[name](cxt, inject);
      if (result === false) {
        break;
      }
    } catch (err) {
      globalError(process.env.NODE_ENV === 'production', err.message);
      cxt.redirect('/error');
      break;
    }
  }
};

export default plugin;
