import { buildSchemaSync } from 'type-graphql';

import { authChecker } from './authChecker';
import { enumsRegister } from './enumsRegister';

// resolver
import OptionResolver from '@/controller/option';
import UserResolver from '@/controller/user';
import PostResolver from '@/controller/post';
import PageResolver from '@/controller/page';
import CommentResolver from '@/controller/comment';
import TermResolver from '@/controller/term';
import MediaResolver from '@/controller/media';
import LinkResolver from '@/controller/link';

// global middleware
import { ErrorInterceptor } from '@/middleware/errorInterceptor';

// 注册enums
enumsRegister();

export const schema = buildSchemaSync({
  resolvers: [
    OptionResolver,
    UserResolver,
    PostResolver,
    PageResolver,
    CommentResolver,
    TermResolver,
    MediaResolver,
    LinkResolver,
  ],
  globalMiddlewares: [ErrorInterceptor],
  authChecker,
  authMode: 'error',
});
