import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getContextObject } from '../utils/get-context-object.utils';

/**
 * 当前请求的 JwtPayload & lang
 */
export const User = createParamDecorator((field: keyof JwtPayloadWithLang, context: ExecutionContext) => {
  const ctx = getContextObject(context);

  if (!ctx) {
    throw Error(`context type: ${context.getType()} not supported`);
  }

  const user: JwtPayloadWithLang = {
    ...ctx.user,
    lang: ctx.i18nLang,
  };

  return field ? user[field] : user;
});
