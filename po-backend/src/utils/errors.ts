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
  constructor(message: string) {
    super(message, 'EXECUTE_FAILED');

    Object.defineProperty(this, 'name', { value: 'RuntimeError' });
  }
}

/**
 * 服务器执行错误
 */
export class ServerError extends Error {
  statusCode?: number;
  response!: any;

  constructor(response: any, message: string) {
    super(message);
    this.response = response;
    this.statusCode = response && response.status;

    Object.defineProperty(this, 'name', { value: 'ServerError' });
  }
}
