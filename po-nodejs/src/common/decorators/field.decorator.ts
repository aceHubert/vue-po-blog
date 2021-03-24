import { parseResolveInfo, ResolveTree, FieldsByTypeName, ParseOptions } from 'graphql-parse-resolve-info';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { SyntaxError } from '@/common/utils/errors.utils';

const Fields = createParamDecorator((options: ParseOptions, context: ExecutionContext):
  | ResolveTree
  | FieldsByTypeName
  | null => {
  const gqlInfo = GqlExecutionContext.create(context).getInfo<GraphQLResolveInfo>();
  const parsedResolveInfoFragment = parseResolveInfo(gqlInfo, options);

  if (!parsedResolveInfoFragment) {
    throw new SyntaxError('Failed to parse resolve info.');
  }

  return parsedResolveInfoFragment;
});

export { Fields, ResolveTree, FieldsByTypeName };
