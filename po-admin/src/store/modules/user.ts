import { VuexModule, Module, VuexMutation, VuexAction, getModule } from 'nuxt-property-decorator';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import { error as globalError } from '@vue-async/utils';
import { store } from '@/store';
import { httpClient, graphqlClient, gql } from '@/includes/functions';
import { UserRole } from '@/includes/datas';
import cookie from '@/utils/cookie';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/config/proLayoutConfigs';

// Types
import { Context } from '@nuxt/types';

export type UserRoles = {
  [role in UserRole]: {
    name: string;
    capabilities: string[];
  };
};

export type LoginQuery = {
  username: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
};

export type RefreshTokenResponse = {
  accessToken: string;
  expiresIn: number;
};

@Module({ store, name: 'user', namespaced: true, dynamic: true, stateFactory: true })
class UserStore extends VuexModule {
  id: string | null = null; // 用户Id， graphql ID 是序列化成string
  name = 'User';
  info: Dictionary<any> = {}; // 用户基本信息及 metas
  accessToken: string | null = null;
  role: UserRole | null = null; // 当前用户角色

  userRoles: UserRoles | null = null; // 用户角色

  // 当前用户权限
  get capabilities() {
    if (this.userRoles && this.role) {
      return this.userRoles[this.role].capabilities;
    }
    return [];
  }

  /**
   * 设置token
   * payload 信息会填充到 states 中
   * 如果传null, 则会重置 states
   * @param token access token
   */
  @VuexMutation
  setAccessToken(token: string | null) {
    this.accessToken = token;

    if (token) {
      try {
        const payload = jwt.decode(token, { json: true });

        const { id, loginName, role, ...rest } = payload as Dictionary<any>;
        this.id = String(id);
        this.name = loginName;
        this.info = Object.assign({}, this.info, rest);
        this.role = role;
      } catch {
        // ate by dog
      }
    } else {
      this.id = null;
      this.name = 'User';
      this.info = {};
      this.role = null;
    }
  }

  @VuexMutation
  setInfo(info: Dictionary<any>) {
    this.info = Object.assign({}, this.info, info);
  }

  @VuexMutation
  setUserRoles(userRoles: UserRoles) {
    this.userRoles = userRoles;
  }

  /**
   * 登录
   * 返回 token 会自动保存到 store accessToken 及 cookie 中
   * @param loginQuery 登录参数
   */
  @VuexAction({ rawError: true, commit: 'setAccessToken' })
  login(loginQuery: LoginQuery) {
    const { req, res } = store.app.context as Context;
    const Cookie = process.client ? cookie.clientCookie : cookie.serverCookie(req, res);

    return httpClient
      .post<LoginResponse>('/auth/login', { username: loginQuery.username, password: loginQuery.password })
      .then((model) => {
        if (model.success) {
          Cookie.set(ACCESS_TOKEN, model.accessToken, {
            path: '/',
            httpOnly: false,
            expires: moment().add(model.expiresIn, 'seconds').toDate(),
          });
          Cookie.set(REFRESH_TOKEN, model.refreshToken, {
            path: '/',
            httpOnly: false,
          });
          return model.accessToken;
        } else {
          throw new Error(model.message);
        }
      });
  }

  /**
   * 刷新 token（支持服务端调用）
   * 返回 token 会自动保存到 store accessToken 及 cookie 中
   * 如果 refresh token 不在在或获取失败则会抛出异常
   */
  @VuexAction({ rawError: true, commit: 'setAccessToken' })
  refreshToken() {
    const { req, res, $i18n } = store.app.context as Context;
    const Cookie = process.client ? cookie.clientCookie : cookie.serverCookie(req, res);
    const refreshtoken = Cookie.get(REFRESH_TOKEN);

    if (!refreshtoken) {
      throw new Error($i18n.tv('refreshTokenRequired', 'The refresh_token is not exists!') as string);
    }

    return httpClient
      .post<RefreshTokenResponse>('/auth/refresh', null, { params: { refreshtoken } })
      .then((model) => {
        if (model.success) {
          Cookie.set(ACCESS_TOKEN, model.accessToken, {
            path: '/',
            httpOnly: false,
            expires: moment().add(model.expiresIn, 'seconds').toDate(),
          });
          return model.accessToken;
        } else {
          throw new Error(model.message);
        }
      });
  }

  /**
   * 获取 user metas(需要权限验证)
   * 可以通过些方法加载不在 token payload 中的数据
   * 返回 meta values 会自动合并到 store info 中
   * @param metaKeys 需要获取的meta keys
   */
  @VuexAction({ rawError: true, commit: 'setInfo' })
  getUserMetas(metaKeys?: string[]) {
    if (!this.accessToken) return Promise.reject();

    return graphqlClient
      .query<{ result: Array<{ metaKey: string; metaValue: string }> }, { userId: string; metaKeys?: string[] }>({
        query: gql`
          query getUserMetas($userId: ID!, $metaKeys: [String!]) {
            result: userMetas(userId: $userId, metaKeys: $metaKeys) {
              metaKey
              metaValue
            }
          }
        `,
        variables: {
          userId: this.id!,
          metaKeys,
        },
      })
      .then(({ data }) => {
        return data.result.reduce((prev, curr) => {
          prev[curr.metaKey] = curr.metaValue;
          return prev;
        }, {} as Dictionary<any>);
      });
  }

  /**
   * 修改 user meta(需要权限验证)
   * 返回成功后会修改 store info的配置
   * @param meta meta
   */
  @VuexAction({ rawError: true, commit: 'setInfo' })
  updateUserMeta(meta: { metaKey: string; metaValue: string }) {
    if (!this.accessToken) return Promise.reject();

    return graphqlClient
      .mutate<{ result: boolean }, { userId: string; metaKey: string; metaValue: string }>({
        mutation: gql`
          mutation updateUserMetaByKey($userId: ID!, $metaKey: String!, $metaValue: String!) {
            retult: updateUserMetaByKey(userId: $userId, metaKey: $metaKey, metaValue: $metaValue)
          }
        `,
        variables: {
          userId: this.id!,
          metaKey: meta.metaKey,
          metaValue: meta.metaValue,
        },
      })
      .then(({ data }) => {
        data?.result ? { [meta.metaKey]: meta.metaValue } : {};
      });
  }

  /**
   * 登出(不会抛出异常，仅支持在客户端调用)
   * 向服务端发出登出信号，清空本地 cookie 保存的token 以及graphqlClient 的缓存
   * 前清除 store accessToken及用户基本信息
   */
  @VuexAction({ rawError: true, commit: 'setAccessToken' })
  logout() {
    if (!this.accessToken) return Promise.resolve();

    const { req, res } = store.app.context as Context;
    const Cookie = process.client ? cookie.clientCookie : cookie.serverCookie(req, res);

    return httpClient
      .post('/auth/logout')
      .then(() => {
        // 清除 store access token
        return null;
      })
      .catch((err) => {
        globalError(process.env.NODE_ENV === 'production', err.message);
        // 清除 store access token
        return null;
      })
      .finally(() => {
        // 清除cookie
        Cookie.set(ACCESS_TOKEN, '', { path: '/', expires: new Date(0) });
        Cookie.set(REFRESH_TOKEN, '', { path: '/', expires: new Date(0) });
        // 清除 client store
        graphqlClient.resetStore();
      });
  }
}

export default getModule(UserStore);
