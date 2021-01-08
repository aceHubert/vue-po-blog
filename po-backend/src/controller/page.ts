import { Resolver, FieldResolver, Query, Mutation, Root, Arg, Args, Ctx, ID } from 'type-graphql';
import { PostType } from '@/model/enums';
import { createMetaResolver } from './meta';

// Types
import { Fields, ResolveTree } from '@/utils/fieldsDecorators';
import User from '@/model/user';
import Page, { PagedPageQueryArgs, PagedPage, PageAddModel, PageMeta, PageMetaAddModel } from '@/model/page';

// Types
import { DataSources } from '../dataSources';

@Resolver((returns) => Page)
export default class PageResolver extends createMetaResolver(Page, PageMeta, PageMetaAddModel, {
  dataSourceKey: 'post',
  name: '页面',
}) {
  @Query((returns) => Page, { nullable: true, description: '获取页面' })
  page(@Arg('id', (type) => ID!) id: number, @Fields() fields: ResolveTree, @Ctx('dataSources') { post }: DataSources) {
    return post.get(id, PostType.Page, Object.keys(fields.fieldsByTypeName.Page));
  }

  @Query((returns) => PagedPage, { description: '获取分页页面列表' })
  pages(@Args() args: PagedPageQueryArgs, @Fields() fields: ResolveTree, @Ctx('dataSources') { post }: DataSources) {
    return post.getPaged(
      args,
      PostType.Page,
      Object.keys(fields.fieldsByTypeName.PagedPage.rows.fieldsByTypeName.Page),
    );
  }

  @FieldResolver((returns) => User, { description: '作者' })
  author(@Root('author') authorId: number, @Fields() fields: ResolveTree, @Ctx('dataSources') { user }: DataSources) {
    return user.get(authorId, Object.keys(fields.fieldsByTypeName.User));
  }

  @Mutation((returns) => Page, { nullable: true, description: '添加页面' })
  addPage(@Arg('model', (type) => PageAddModel) model: PageAddModel, @Ctx('dataSources') { post }: DataSources) {
    return post.create(model, PostType.Page);
  }
}
