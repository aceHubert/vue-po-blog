import { buildSchemaSync } from 'type-graphql';
import { customAuthChecker } from './customAuthChecker';
import { registerEnums } from './registerEnums';

// resolver
import InitResolver from '@/controller/init';
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
registerEnums();

export const schema = buildSchemaSync({
  resolvers: [
    InitResolver,
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
  authChecker: customAuthChecker,
  authMode: 'error',
});
