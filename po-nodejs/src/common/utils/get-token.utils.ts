import { Request } from 'express';
import { AuthenticationError } from './gql-errors.utils';

/**
 * 获取Token
 * header authorization 格式不正确会抛出 AuthenticationError
 * @param request express Request
 */
export function getToken(request: Request): string | null {
  if (request.headers.authorization) {
    const parts = request.headers.authorization.split(' ');
    if (parts.length == 2) {
      const scheme = parts[0];
      const credentials = parts[1];
      if (/^Bearer$/i.test(scheme)) {
        return credentials;
      } else {
        throw new AuthenticationError('Format is Authorization: Bearer [token]');
      }
    } else {
      throw new AuthenticationError('Format is Authorization: Bearer [token]');
    }
  } else if (request.query && request.query.token) {
    return request.query.token as string;
  }
  return null;
}
