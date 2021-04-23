/* eslint-disable no-console */
import { ExecutionContext } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';

export function getContextObject(context: ExecutionContext): any {
  switch (context.getType<GqlContextType>()) {
    case 'http':
      return context.switchToHttp().getRequest();
    case 'graphql':
      return GqlExecutionContext.create(context).getContext();
    case 'rpc':
      return context.switchToRpc().getContext();
    default:
      return null;
  }
}
