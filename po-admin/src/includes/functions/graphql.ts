// https://apollo.vuejs.org/guide/installation.html
import { ApolloClient, isApolloError } from 'apollo-client';
import fetch from 'cross-fetch';
import { Observable, from } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { ServerError, ServerParseError } from 'apollo-link-http-common';
// import { WebSocketLink } from 'apollo-link-ws';
// import { SubscriptionClient } from 'subscriptions-transport-ws';
import { onError } from 'apollo-link-error';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
import { appStore, userStore } from '@/store/modules';
import settingsFuncs from './settings';

/**
 * 是否是 Server error
 * 如果是 ApolloError，则会判断err.networkError
 */
function isServerError(err: Error): err is ServerError {
  return isApolloError(err)
    ? !!(err.networkError && err.networkError.hasOwnProperty('statusCode')) && err.networkError.hasOwnProperty('result')
    : err.hasOwnProperty('statusCode') && err.hasOwnProperty('result');
}

function isServerParseError(err: Error): err is ServerParseError {
  return isApolloError(err)
    ? !!(err.networkError && err.networkError.hasOwnProperty('statusCode')) &&
        err.networkError.hasOwnProperty('bodyText')
    : err.hasOwnProperty('statusCode') && err.hasOwnProperty('bodyText');
}

// graphql error code 对应 http code 关系
const GraphqlErrorCodes: Dictionary<number> = {
  BAD_USER_INPUT: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  VALIDATION_FAILED: 405,
  INTERNAL_SERVER_ERROR: 500,
  // 其它错误当成 500 处理
};

/**
 * 从error 中生成 code 和 message
 * code 在 networkError 中将会是 error.[statusCode], graphQLErrors 中将会是第一条 error.[extensions.code], fallbace: code.500
 * @param err Error
 */
function formatError(err: Error) {
  if (isApolloError(err)) {
    const graphQLErrors = err.graphQLErrors;
    const networkError = err.networkError;
    if (Array.isArray(graphQLErrors) && graphQLErrors.length) {
      // 第一要包含code的详细信息
      const extensions = graphQLErrors.find((error) => error.extensions && error.extensions.code)?.extensions;
      return {
        statusCode: extensions ? extensions.statusCode || GraphqlErrorCodes[extensions.code] || 500 : 500,
        message: graphQLErrors
          .map((graphQLError) => graphQLError?.message)
          .filter(Boolean)
          .join('; '),
      };
    } else if (networkError && isServerError(networkError)) {
      return {
        statusCode: networkError.statusCode,
        message: networkError.message,
      };
    }
  }
  return {
    statusCode: 500,
    message: err.message,
  };
}

// onErrer retry async refreshToken
const promiseToObservable = <T>(promise: Promise<T>, error?: (error: Error) => void) =>
  new Observable<T>((subscriber) => {
    promise.then((value) => {
      if (subscriber.closed) return;
      subscriber.next(value);
      subscriber.complete();
    }, error?.bind(subscriber) || subscriber.error.bind(subscriber));
  });

const httpLink = new HttpLink({
  uri: settingsFuncs.getGraphqlPath,
  fetch,
});

// 忽略在头部加Authorization Token
const IgnoreHeaderTokenOperationNames = ['IntrospectionQuery', 'initCheck', 'initDB', 'getAutoloadOptions'];

// set Authorization header
const authLink = setContext((operation, { headers, ...context }) => {
  const token = userStore.accessToken;

  return {
    headers: {
      ...headers,
      ...(!(operation.operationName && IgnoreHeaderTokenOperationNames.includes(operation.operationName)) && token
        ? { Authorization: `Bearer ${token}` }
        : {}),
    },
    ...context,
  };
});

// error handle
const errorLink = onError(({ networkError, graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    // 需要初始化数据库(graphql resolver执行中产生的错误)
    if (graphQLErrors.some((err) => err.extensions?.dbInitRequired)) {
      appStore.goToInitPage();
      return;
    }
  }

  if (networkError) {
    if (isServerError(networkError) || isServerParseError(networkError)) {
      const statusCode = networkError.statusCode;

      if (statusCode === 401) {
        // 401 后通过 refresh token 重新获取 access token,如果再不成功则退出重新登录
        return promiseToObservable<string>(userStore.refreshToken(), () => {
          appStore.goToLogoutPage();
        }).flatMap(() => {
          const headers = {
            ...operation.getContext().headers,
            Authorization: `Bearer ${userStore.accessToken}`,
          };
          operation.setContext({
            headers,
          });
          return forward(operation);
        });
      } else if (statusCode === 500) {
        // 需要初始化(以 http code 返回，中间件优先于graphql resolver执行时产生的错误)
        if (isServerError(networkError) && networkError.result.dbInitRequired) {
          appStore.goToInitPage();
        }
      }
    }
  }

  return;
});

// const wsClient = new SubscriptionClient(settingsFuncs.getGraphqlWsPath(), {
//   reconnect: true,
// });

// const wsLink = new WebSocketLink(wsClient);

const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  ssrMode: true,
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
    mutate: {
      fetchPolicy: 'no-cache',
    },
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
  },
  connectToDevTools: process.env.NODE_ENV === 'development',
});

export { gql, formatError, isServerError, isServerParseError };

export default client;
