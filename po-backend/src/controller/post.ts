import { Resolver, FieldResolver, Query, Mutation, Root, Arg, Args, Ctx, ID } from 'type-graphql';
import { PostType } from '@/model/enums';
import { createMetaResolver } from './meta';

// Typs
import { Fields, ResolveTree } from '@/utils/fieldsDecorators';
import { DataSources } from '@/dataSources';
import User from '@/model/user';
import Post, { PagedPostQueryArgs, PagedPost, PostAddModel, PostMeta, PostMetaAddModel } from '@/model/post';

@Resolver((returns) => Post)
export default class PostResolver extends createMetaResolver(Post, PostMeta, PostMetaAddModel, {
  name: '文章',
}) {
  @Query((returns) => Post, { nullable: true, description: '获取文章' })
  post(@Arg('id', (type) => ID!) id: number, @Fields() fields: ResolveTree, @Ctx('dataSources') { post }: DataSources) {
    return post.get(id, PostType.Post, Object.keys(fields.fieldsByTypeName.Post));
  }

  @Query((returns) => PagedPost, { description: '获取分页文章列表' })
  posts(@Args() args: PagedPostQueryArgs, @Fields() fields: ResolveTree, @Ctx('dataSources') { post }: DataSources) {
    return post.getPaged(
      args,
      PostType.Post,
      Object.keys(fields.fieldsByTypeName.PagedPost.rows.fieldsByTypeName.Post),
    );
  }

  @FieldResolver((returns) => User, { description: '作者' })
  author(@Root('author') authorId: number, @Fields() fields: ResolveTree, @Ctx('dataSources') { user }: DataSources) {
    return user.get(authorId, Object.keys(fields.fieldsByTypeName.User));
  }

  @Mutation((returns) => Post, { nullable: true, description: '添加文章' })
  addPost(@Arg('model', (type) => PostAddModel) model: PostAddModel, @Ctx('dataSources') { post }: DataSources) {
    return post.create(model, PostType.Post);
  }
}
