import path from 'path';
import { upperCase } from 'lodash';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@/config/config.module';
import { GlobalCacheModule } from '@/global-cache/global-cache.module';
import { DataSourceModule } from '@/sequelize-datasources/datasource.module';
import { AuthModule } from '@/auth/auth.module';
import { DbInitModule } from '@/db-init/db-init.module';

// graphql
import { GraphQLModule, registerEnumType } from '@nestjs/graphql';
import { CommentModule } from '@/comments/comment.module';
import { LinkModule } from '@/links/link.module';
import { MediaModule } from '@/medias/media.module';
import { OptionModule } from '@/options/option.module';
import { PageModule } from '@/pages/page.module';
import { PostModule } from '@/posts/post.module';
import { TermModule } from '@/terms/term.module';
import { UserModule } from '@/users/user.module';

// 注册 graphql 枚举类型
import * as Enums from '@/common/helpers/enums';
import { UserRoleWithNone } from '@/users/dto/update-user.input';
Object.keys(Enums).map((key) => {
  registerEnumType((Enums as any)[key], {
    name: upperCase(key).replace(/ /g, '_'),
    description: key,
  });
});

registerEnumType(UserRoleWithNone, {
  name: upperCase('UserRoleWithNone').replace(/ /g, '_'),
  description: 'UserRole(includes "none")',
});

// middleware
import { graphqlErrorInterceptorMiddleware } from '~/common/middlewares/graphql-error-interceptor.middleware';

@Module({
  imports: [
    ConfigModule.register({ file: 'po-config.json' }),
    GlobalCacheModule,
    DataSourceModule,
    AuthModule,
    DbInitModule,
    CommentModule,
    LinkModule,
    MediaModule,
    OptionModule,
    PageModule,
    PostModule,
    TermModule,
    UserModule,
    GraphQLModule.forRoot({
      debug: process.env.NODE_ENV !== 'production',
      playground: true,
      installSubscriptionHandlers: true,
      autoSchemaFile: path.join(__dirname, 'schema.gql'),
      buildSchemaOptions: {
        fieldMiddleware: [graphqlErrorInterceptorMiddleware],
      },
      subscriptions: {
        path: '/subscriptions',
      },
      context: async ({ req, connection }) => {
        if (connection) {
          // check connection for metadata
          return connection.context;
        } else {
          return {
            user: req.user, // from express-jwt
          };
        }
      },
    }),
  ],
})
export class AppModule {}
