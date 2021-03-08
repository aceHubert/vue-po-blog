/**
 * ApolloServer Plugin
 * 将 type-graphql @Authorized 的错误 从 response.data 提升到 http
 * @Authorized() => 401
 * @Authorized("admin") => 403
 * * 不验证 token 的有效期 *
 */
import { throwHttpGraphQLError } from 'apollo-server-core/dist/runHttpQuery';
import { UnauthorizedError, ForbiddenError } from 'type-graphql';
import { AuthenticationError } from '@/utils/errors';
import { AuthHelper } from '@/dataSources';

// Types
import { GraphQLError } from 'graphql';
import { PluginDefinition } from 'apollo-server-core';

const debugDefault = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';

export const authChecker: PluginDefinition = {
  requestDidStart(requestContext) {
    const req = requestContext.request;
    const context = requestContext.context as ContextType;
    const authHelper = new AuthHelper(requestContext.cache);

    context.authHelper = authHelper;

    // 设置 token
    context.token = (function fromHeaderOrQuerystring() {
      let authorization: string | null;
      if (req.http && (authorization = req.http.headers.get('authorization'))) {
        const parts = authorization.split(' ');
        if (parts.length == 2) {
          const scheme = parts[0];
          const credentials = parts[1];
          if (/^Bearer$/i.test(scheme)) {
            return credentials;
          } else {
            throwHttpGraphQLError(401, [new AuthenticationError('Format is Authorization: Bearer [token]')], {
              debug: debugDefault,
            });
          }
        } else {
          throwHttpGraphQLError(401, [new AuthenticationError('Format is Authorization: Bearer [token]')], {
            debug: debugDefault,
          });
        }
      } else if (req.query) {
        return (
          req.query
            .split('&')
            .map((arg) => {
              const keyValue = arg.split('=', 2);
              if (keyValue.length === 2 && keyValue[0] === 'token') {
                return keyValue[1];
              }
              return null;
            })
            .find((arg) => !!arg) || null
        );
      }
      return null;
    })();

    return {
      async didResolveSource(requestContext) {
        const context = requestContext.context as ContextType;

        // 从 token 上得到 user
        // 不验证token expired，到具体的 @Authorized 上验证token 是否有效
        if (context.token) {
          try {
            context.user = await authHelper.verifyToken(context.token, { ignoreExpiration: true });
          } catch (err) {
            throwHttpGraphQLError(401, [err], { debug: debugDefault });
          }
        }
      },
      didEncounterErrors({ errors }) {
        let error: GraphQLError | undefined;
        // type-graphql authChecker 没有角色 会返回 UnauthorizedError，否则返回 ForbiddenError
        if ((error = errors.find((error) => error.originalError instanceof UnauthorizedError))) {
          throwHttpGraphQLError(401, [error.originalError!], { debug: debugDefault });
        } else if ((error = errors.find((error) => error.originalError instanceof ForbiddenError))) {
          throwHttpGraphQLError(403, [error.originalError!], { debug: debugDefault });
        }
      },
    };
  },
};
