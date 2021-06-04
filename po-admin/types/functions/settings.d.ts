export interface SettingsFunctions {
  /**
   * vue-router base path(末尾带有"/")
   */
  getBasePath(): string;
  /**
   * site url(末尾带有"/")
   */
  getSiteUrl(): string;
  /**
   * home url(末尾带有"/")
   */
  getHomeUrl(): string;
  /**
   * request server url
   */
  getServerUrl(): string;
  /**
   * api request path
   */
  getApiPath(): string;
  /**
   * graphql request path
   */
  getGraphqlPath(): string;
  /**
   * graphql websocket path
   */
  getGraphqlWsPath(): string;
}
