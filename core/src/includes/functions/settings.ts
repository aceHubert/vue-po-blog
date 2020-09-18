import Vue from 'vue';
import merge from 'lodash.merge';
import { trailingSlash, isAbsoluteUrl } from '@/utils/path';

// Types
import { Settings } from 'types/functions/site';

export const globalSettings: Settings = Vue.observable({
  name: '',
  domain: '',
  icp: null,
  copyright: null,
  staticDir: 'static/',
  apiPath: 'api/blog/',
});

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * 配置的域名（末尾带有"/"
 */
export function getDomain() {
  return trailingSlash(globalSettings.domain);
}

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * 相对于配置域名的静态文件目录（末尾带有"/"）
 */
export function getStaticDir() {
  return trailingSlash(globalSettings.staticDir);
}

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * API 地址，如果不是http(s) 绝对路径，则会以当前域名为绝对路径
 */
export function getApiPath() {
  return trailingSlash(
    isAbsoluteUrl(globalSettings.apiPath)
      ? globalSettings.apiPath
      : getDomain() +
          (globalSettings.apiPath.startsWith('/') ? globalSettings.apiPath.substr(1) : globalSettings.apiPath),
  );
}

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * Copyright
 */
export function getCopyright() {
  return globalSettings.copyright;
}

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * ICP
 */
export function getICP() {
  return globalSettings.icp;
}

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * 配置的 Logo, todo:扩展支持图片
 */
export function getLogo() {
  return {
    type: 'text',
    content: globalSettings.name,
  };
}

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * 设置网站配置
 */
export function setSettings(settings: Partial<Settings>) {
  merge(globalSettings, settings);
}
