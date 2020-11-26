import { http } from '../functions';

import { PluginsApi, PluginsModel } from 'types/datas/plugin';

function formatPlugin(plugin: any): PluginsModel {
  const { description, title, pluginId, userName, updateTime, uid } = plugin;
  return Object.assign({
    description,
    title,
    pluginId,
    userName,
    updateTime,
    uid,
  });
}

export const pluginApi: PluginsApi = {
  /**
   * 获取文章列表
   * @param param
   */
  getList({ page = 1, size = 10, ...rest } = {}) {
    return http
      .getList('/byteblogs/plugins/v1/list', { params: { page, size, ...rest } })
      .then(({ models, pageInfo }) => {
        return {
          rows: models.map((plugin) => formatPlugin(plugin)),
          pager: pageInfo!,
        };
      });
  },
  downloadPlugin(pluginId) {
    return http.post(`/v1/plumemo/module/download/plugin/${pluginId}`).then(() => true);
  },
  getPluginIdList() {
    return http.getList(`/v1/plumemo/module/plugin-ids`).then(({ models }) => {
      return models;
    });
  },
};
