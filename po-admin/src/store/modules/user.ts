import { VuexModule, Module, VuexMutation, VuexAction, getModule } from 'nuxt-property-decorator';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import { error as globalError } from '@vue-async/utils';
import { store } from '@/store';
import { httpClient, graphqlClient, gql } from '@/includes/functions';
import { UserRole, UserCapability } from '@/includes/datas';
import cookie from '@/utils/cookie';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/config/proLayoutConfigs';

// Types
import { Context } from '@nuxt/types';
import { User, Meta } from 'types/datas';

export type RoleCapabilities = {
  [role in UserRole]: {
    name: string;
    capabilities: UserCapability[];
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
  loginName = 'User';
  info: Dictionary<any> = {}; // 用户基本信息及 metas
  accessToken: string | null = null;

  roleCapabilities: RoleCapabilities | null = null; // 用户角色权限

  // 用户角色
  get role() {
    return this.info.role;
  }

  // 当前用户权限
  get capabilities() {
    if (this.roleCapabilities && this.role) {
      return this.roleCapabilities[this.role as UserRole].capabilities;
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

        const { id, loginName, ...rest } = payload as Dictionary<any>;
        this.id = String(id);
        this.loginName = loginName;
        this.info = Object.assign({}, this.info, rest);
      } catch {
        // ate by dog
      }
    } else {
      this.id = null;
      this.loginName = 'User';
      this.info = {};
    }
  }

  @VuexMutation
  setInfo(info: Dictionary<any>) {
    this.info = Object.assign({}, this.info, info);
  }

  @VuexMutation
  setRoleCapabilities(roleCapabilities: RoleCapabilities) {
    this.roleCapabilities = roleCapabilities;
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
      .post<LoginResponse>('/auth/login', {
        username: loginQuery.username,
        password: loginQuery.password,
        device: 'Web', // todo: 多设备登录
      })
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
          // 清除 refresh token from cookie
          Cookie.set(REFRESH_TOKEN, '', { path: '/', expires: new Date(0) });
          throw new Error(model.message);
        }
      });
  }

  /**
   * 获取用户信息，包括meta(需要权限验证)
   * 可以通过些方法加载不在 token payload 中的数据
   * 返回 meta values 会自动合并到 store info 中
   * @param metaKeys 需要获取的meta keys
   */
  @VuexAction({ rawError: true, commit: 'setInfo' })
  getUserInfo(metaKeys?: string[]) {
    if (!this.accessToken) return Promise.reject();

    return graphqlClient
      .query<{ result: User & { metas: Meta[] } }, { metaKeys?: string[] }>({
        query: gql`
          query getUser($metaKeys: [String!]) {
            result: user {
              displayName
              email
              mobile
              url
              metas(metaKeys: $metaKeys) {
                metaKey
                metaValue
              }
            }
          }
        `,
        variables: {
          metaKeys,
        },
      })
      .then(({ data }) => {
        return Object.keys(data.result).reduce((prev, key) => {
          if (key === 'metas') {
            data.result.metas.forEach((meta) => {
              prev[meta.metaKey] = meta.metaValue;
            });
          } else {
            prev[key] = data.result[key as keyof User];
          }
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
        // 清除 tokens from cookie
        Cookie.set(ACCESS_TOKEN, '', { path: '/', expires: new Date(0) });
        Cookie.set(REFRESH_TOKEN, '', { path: '/', expires: new Date(0) });
        // 清除 client store
        graphqlClient.resetStore();
      });
  }
}

export default getModule(UserStore);
