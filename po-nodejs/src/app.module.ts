import * as path from 'path';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { I18nModule, QueryResolver, HeaderResolver, AcceptLanguageResolver, CookieResolver } from 'nestjs-i18n';
import { I18nJsonParser } from '@/common/parsers/i18n.json.parser';
import { AuthorizedGuard } from '@/common/guards/authorized.guard';
import { AllExceptionFilter } from '@/common/filters/all-exception.filter';
import { I18nValidationPipe } from '@/common/pipes/i18n-validation.pipe';
import { ConfigModule } from '@/config/config.module';
import { GlobalCacheModule } from '@/global-cache/global-cache.module';
import { DataSourceModule } from '@/sequelize-datasources/datasource.module';
import { FileManageModule } from '@/file-manage/file-manage.module';
import { AuthModule } from '@/auth/auth.module';
import { DbInitModule } from '@/db-init/db-init.module';

// graphql
import { GraphQLModule } from '@nestjs/graphql';
import { CommentModule } from '@/comments/comment.module';
import { LinkModule } from '@/links/link.module';
import { MediaModule } from '@/medias/media.module';
import { OptionModule } from '@/options/option.module';
import { PageModule } from '@/pages/page.module';
import { PostModule } from '@/posts/post.module';
import { TermModule } from '@/terms/term.module';
import { UserModule } from '@/users/user.module';

const isProduction = process.env.NODE_ENV === 'production';
const contentPath = isProduction ? path.join(process.cwd(), 'po-content') : path.join(__dirname, '../../po-content');

@Module({
  imports: [
    GlobalCacheModule,
    ConfigModule.register({ path: path.join(process.cwd(), 'po-config.server.json') }),
    I18nModule.forRootAsync({
      useFactory: () => {
        return {
          fallbackLanguage: 'en-US',
          fallbacks: {
            en: 'en-US',
            'en-*': 'en-US',
            zh: 'zh-CN',
            'zh-*': 'zh-CN',
          },
          parserOptions: {
            paths: [path.join(contentPath, '/languages/nodejs')],
            watch: !isProduction,
          },
        };
      },
      parser: I18nJsonParser,
      resolvers: [
        new QueryResolver(['lang', 'locale', 'l']),
        new HeaderResolver(['x-custom-lang', 'x-custom-locale']),
        new CookieResolver(['lang', 'locale', 'l']),
        AcceptLanguageResolver,
      ],
    }),
    FileManageModule.register({
      dest: path.join(contentPath, 'uploads'),
    }),
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
      debug: !isProduction,
      playground: !isProduction,
      installSubscriptionHandlers: true,
      autoSchemaFile: path.join(__dirname, 'schema.gql'),
      context: async ({ req, connection }) => {
        if (connection) {
          // check connection for metadata
          return {
            req: connection.context, // for nestjs-i18n
          };
        } else {
          return {
            user: req.user, // from express-jwt
            req, // for nestjs-i18n
          };
        }
      },
    }),
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: I18nValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: AuthorizedGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
  ],
})
export class AppModule {}
