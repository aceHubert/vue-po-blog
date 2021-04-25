import { PagerResponse } from './pager';

export type PluginsModel = {
  description: string;
  pluginId: string;
  title: string;
  userName: string;
  updateTime: string;
  uid: string;
};

export type PluginsPagerResponse = PagerResponse<PluginsModel>;

export type PluginsPagerQuery = {
  page?: number;
  size?: number;
};
