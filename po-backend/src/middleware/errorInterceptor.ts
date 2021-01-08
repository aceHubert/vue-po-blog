/**
 * Global ErrorInterceptor Middleware
 */
import { MiddlewareInterface, ResolverData, NextFn } from 'type-graphql';

export class ErrorInterceptor implements MiddlewareInterface<ContextType> {
  constructor() {}

  async use(_: ResolverData<ContextType>, next: NextFn) {
    try {
      return await next();
    } catch (err) {
      //todo: write error to file log

      console.log(err);

      throw err;
    }
  }
}
