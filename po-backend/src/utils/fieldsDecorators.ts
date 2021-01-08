import { parseResolveInfo, ResolveTree, FieldsByTypeName, ParseOptions } from 'graphql-parse-resolve-info';
import { createParamDecorator } from 'type-graphql';

function Fields(options?: ParseOptions): ParameterDecorator {
  return createParamDecorator(({ info }): ResolveTree | FieldsByTypeName | null => {
    const parsedResolveInfoFragment = parseResolveInfo(info, options);

    if (!parsedResolveInfoFragment) {
      throw new Error('Failed to parse resolve info.');
    }

    return parsedResolveInfoFragment;
  });
}

export { Fields, ResolveTree, FieldsByTypeName };
