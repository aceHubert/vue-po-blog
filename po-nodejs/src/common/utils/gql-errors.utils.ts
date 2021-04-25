/**
 * Graphql Errors
 */
import { ApolloError } from 'apollo-server-core';

export {
  ApolloError,
  toApolloError,
  UserInputError,
  SyntaxError,
  ValidationError,
  ForbiddenError,
  AuthenticationError,
} from 'apollo-server-express';

/**
 * 程序执行错误
 */
export class RuntimeError extends ApolloError {
  constructor(message: string, properties?: Record<string, any>) {
    super(message, 'EXECUTE_FAILED', properties);

    Object.defineProperty(this, 'name', { value: 'RuntimeError' });
  }
}

/**
 * 判断是 apollo error
 * @param err Error
 */
export function isApolloError(err: Error) {
  return err.hasOwnProperty('graphQLErrors');
}
