import { Resolver, FieldResolver, Query, Mutation, Root, Arg, Args, Ctx, ID } from 'type-graphql';

// Types
import { Fields, ResolveTree } from '@/utils/fieldsDecorators';
import { DataSources } from '@/dataSources';
import User from '@/model/user';
import Link, { PagedLinkQueryArgs, PagedLink, LinkAddModel } from '@/model/link';

@Resolver((returns) => Link)
export default class LinkResolver {
  @Query((returns) => Link, { nullable: true, description: '获取链接' })
  link(@Arg('id', (type) => ID!) id: number, @Fields() fields: ResolveTree, @Ctx('dataSources') { link }: DataSources) {
    return link.get(id, Object.keys(fields.fieldsByTypeName.Link));
  }

  @Query((returns) => PagedLink, { description: '获取链接分页列表' })
  links(@Args() args: PagedLinkQueryArgs, @Fields() fields: ResolveTree, @Ctx('dataSources') { link }: DataSources) {
    return link.getPaged(args, Object.keys(fields.fieldsByTypeName.PagedLink.rows.fieldsByTypeName.Link));
  }

  @FieldResolver((returns) => User, { nullable: true, description: '创建用户' })
  user(@Root('userId') userId: number, @Fields() fields: ResolveTree, @Ctx('dataSources') { user }: DataSources) {
    return user.get(userId, Object.keys(fields.fieldsByTypeName.User));
  }

  @Mutation((returns) => Link, { nullable: true, description: '添加链接' })
  addLink(@Arg('model', (type) => LinkAddModel) model: LinkAddModel, @Ctx('dataSources') { link }: DataSources) {
    return link.create(model);
  }
}
