import warning from 'warning';
import { Initializer } from './initializer';
import { Locale } from './locale';
import { LoadModules } from './loadModules';

// Types
import { Plugin } from '@nuxt/types';

const plugin: Plugin = async (cxt, inject) => {
  const bootstrapWaterfall: Dictionary<(...params: Parameters<Plugin>) => Promise<boolean | void>> = {
    Initializer,
    Locale,
    LoadModules,
  };

  // 按顺序执行
  // 如遇到 return false(模块内自行处理是否跳转错误页面等操作)
  // 或 throw Error(跳转到错误页面) 将终止后面的模块执行
  for (const name in bootstrapWaterfall) {
    try {
      await bootstrapWaterfall[name](cxt, inject);
    } catch (err) {
      warning(process.env.NODE_ENV === 'production', err.message);
      throw err;
      // cxt.error({});
      // break;
    }
  }
};

export default plugin;
