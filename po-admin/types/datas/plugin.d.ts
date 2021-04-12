import { PagedQuery, PagedResponse } from './paged';

export type PluginsModel = {
  description: string;
  pluginId: string;
  title: string;
  userName: string;
  updateTime: string;
  uid: string;
};

export type PluginsPagedQuery = PagedQuery<{}>;

export type PluginsPagedResponse = PagedResponse<PluginsModel>;
