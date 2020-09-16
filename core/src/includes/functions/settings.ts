import AppStore from '@/store/modules/app';
import { trailingSlash, isAbsoluteUrl } from '@/utils/path';

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * 配置的域名（末尾带有"/"
 */
export function getDomain() {
  return trailingSlash(AppStore.settings.domain);
}

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * 相对于配置域名的静态文件目录（末尾带有"/"）
 */
export function getStaticDir() {
  return trailingSlash(AppStore.settings.staticDir);
}

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * API 地址，如果不是http(s) 绝对路径，则会以当前域名为绝对路径
 */
export function getApiPath() {
  return trailingSlash(
    isAbsoluteUrl(AppStore.settings.apiPath)
      ? AppStore.settings.apiPath
      : getDomain() +
          (AppStore.settings.apiPath.startsWith('/') ? AppStore.settings.apiPath.substr(1) : AppStore.settings.apiPath),
  );
}

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * Copyright
 */
export function getCopyright() {
  return AppStore.settings.copyright;
}

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * ICP
 */
export function getICP() {
  return AppStore.settings.icp;
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
    content: AppStore.settings.name,
  };
}
