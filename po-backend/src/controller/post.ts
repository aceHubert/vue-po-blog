import { Resolver, FieldResolver, Query, Mutation, Root, Arg, Args, Ctx, ID, Int } from 'type-graphql';
import { PostType, PostStatus, PostCommentStatus } from '@/dataSources';
import { createMetaResolver } from './meta';

// Typs
import { Fields, ResolveTree } from '@/utils/fieldsDecorators';
import { DataSources } from '@/dataSources';
import User from '@/model/user';
import Post, {
  PagedPostQueryArgs,
  PagedPost,
  PostStatusCount,
  PostAddModel,
  PostMeta,
  PostMetaAddModel,
  PostUpdateModel,
  PostDayCount,
  PostMonthCount,
  PostYearCount,
} from '@/model/post';

@Resolver((returns) => Post)
export default class PostResolver extends createMetaResolver(Post, PostMeta, PostMetaAddModel, {
  name: '文章',
}) {
  @Query((returns) => Post, { nullable: true, description: '获取文章' })
  post(
    @Arg('id', (type) => ID!, { description: 'Post id' }) id: number,
    @Fields() fields: ResolveTree,
    @Ctx('dataSources') { post }: DataSources,
  ) {
    return post.get(id, PostType.Post, this.getFieldNames(fields.fieldsByTypeName.Post));
  }

  @Query((returns) => PagedPost, { description: '获取分页文章列表' })
  posts(@Args() args: PagedPostQueryArgs, @Fields() fields: ResolveTree, @Ctx('dataSources') { post }: DataSources) {
    return post.getPaged(
      args,
      PostType.Post,
      this.getFieldNames(fields.fieldsByTypeName.PagedPost.rows.fieldsByTypeName.Post),
    );
  }

  @Query((returns) => [PostStatusCount], { description: '获取文章按状态分组数量' })
  postCountByStatus(@Ctx('dataSources') { post }: DataSources) {
    return post.getCountByStatus(PostType.Post);
  }

  @Query((returns) => [PostDayCount], { description: '获取文章按天分组数量' })
  postCountByDay(
    @Arg('month', { description: '月份，格式：yyyyMM' }) month: string,
    @Ctx('dataSources') { post }: DataSources,
  ) {
    return post.getCountByDay(month, PostType.Post);
  }

  @Query((returns) => [PostMonthCount], { description: '获取文章按月分组数量' })
  postCountByMonth(
    @Arg('year', (type) => String, { nullable: true, description: '年份，格式：yyyy' }) year: string | undefined,
    @Arg('months', (type) => Int, {
      nullable: true,
      description: '从当前日期向前推多少个月(如果year有值则忽略)，默认：12',
    })
    months: number | undefined,
    @Ctx('dataSources') { post }: DataSources,
  ) {
    return post.getCountByMonth({ year, months }, PostType.Post);
  }

  @Query((returns) => [PostYearCount], { description: '获取文章按年分组数量' })
  postCountByYear(@Ctx('dataSources') { post }: DataSources) {
    return post.getCountByYear(PostType.Post);
  }

  @FieldResolver((returns) => User, { description: '作者' })
  author(@Root('author') authorId: number, @Fields() fields: ResolveTree, @Ctx('dataSources') { user }: DataSources) {
    return user.get(authorId, this.getFieldNames(fields.fieldsByTypeName.User));
  }

  @Mutation((returns) => Post, { nullable: true, description: '添加文章（不可添加为 Trash 状态，否则无法直接修改）' })
  addPost(@Arg('model', (type) => PostAddModel) model: PostAddModel, @Ctx('dataSources') { post }: DataSources) {
    return post.create(model, PostType.Post);
  }

  @Mutation((returns) => Boolean, { description: '修改文章（Trash 状态下不支持修改）' })
  updatePost(
    @Arg('id', (type) => ID) id: number,
    @Arg('model', (type) => PostUpdateModel) model: PostUpdateModel,
    @Ctx('dataSources') { post }: DataSources,
  ) {
    return post.update(id, model);
  }

  @Mutation((returns) => Boolean, { description: '修改文章评论状态' })
  updatePostCommentStatus(
    @Arg('id', (type) => ID) id: number,
    @Arg('status', (type) => PostCommentStatus) status: PostCommentStatus,
    @Ctx('dataSources') { post }: DataSources,
  ) {
    return post.updateCommentStatus(id, status);
  }

  // Page 状共用以下方法
  @Mutation((returns) => Boolean, { description: '修改文章或页面状态（Trash 状态下不支持修改）' })
  updatePostOrPageStatus(
    @Arg('id', (type) => ID) id: number,
    @Arg('status', (type) => PostStatus) status: PostStatus,
    @Ctx('dataSources') { post }: DataSources,
  ) {
    return post.updateStatus(id, (status as unknown) as PostStatus);
  }

  @Mutation((returns) => Boolean, { description: '批量修改文章或页面状态（Trash 状态下不支持修改）' })
  blukUpdatePostOrPageStatus(
    @Arg('ids', (type) => [ID]) ids: number[],
    @Arg('status', (type) => PostStatus) status: PostStatus,
    @Ctx('dataSources') { post }: DataSources,
  ) {
    return post.blukUpdateStatus(ids, (status as unknown) as PostStatus);
  }

  @Mutation((returns) => Boolean, {
    description: '重置文章或页面成移入到 Trash 之前状态（历史状态不存在或数据结构异常，会造成重置不成功）',
  })
  restorePostOrPage(@Arg('id', (type) => ID) id: number, @Ctx('dataSources') { post }: DataSources) {
    return post.restore(id);
  }

  @Mutation((returns) => Boolean, {
    description: '批量重置文章或页面成移入到 Trash 之前状态',
  })
  blukRestorePostOrPage(@Arg('ids', (type) => [ID]) ids: number[], @Ctx('dataSources') { post }: DataSources) {
    return post.blukRestore(ids);
  }

  @Mutation((returns) => Boolean, { description: '删除文章或页面（非 Trash 状态下无法删除）' })
  removePostOrPage(@Arg('id', (type) => ID) id: number, @Ctx('dataSources') { post }: DataSources) {
    return post.delete(id);
  }
}
