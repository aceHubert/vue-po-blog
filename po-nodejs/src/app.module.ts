import path from 'path';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@/config/config.module';
import { CustomCacheModule } from '@/custom-cache/custom-cache.module';
import { DataSourceModule } from '@/sequelize-datasources/datasource.module';
import { AuthModule } from '@/auth/auth.module';
import { DbInitModule } from '@/db-init/db-init.module';

// graphql
import { GraphQLModule } from '@nestjs/graphql';
import { enumsRegister } from '@/common/helpers/enums-register';
import { CommentModule } from '@/comments/comment.module';
import { LinkModule } from '@/links/link.module';
import { MediaModule } from '@/medias/media.module';
import { OptionModule } from '@/options/option.module';
import { PageModule } from '@/pages/page.module';
import { PostModule } from '@/posts/post.module';
import { TermModule } from '@/terms/term.module';
import { UserModule } from '@/users/user.module';

// middleware
import { graphqlErrorInterceptorMiddleware } from '~/common/middlewares/graphql-error-interceptor.middleware';

// filters
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';

// guard
import { AuthorizedGuard } from '@/common/guards/authorized.guard';

// 注册枚举
enumsRegister();

@Module({
  imports: [
    ConfigModule.register({ file: 'po-config.json' }),
    CustomCacheModule,
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
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: AuthorizedGuard,
    },
  ],
})
export class AppModule {}
