export interface SettingsFunctions {
  /**
   * request server url
   */
  getServerUrl(): string;
  /**
   * vue-router base path
   */
  getBasePath(): string;
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
