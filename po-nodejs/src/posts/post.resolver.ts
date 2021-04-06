import { ModuleRef } from '@nestjs/core';
import { Resolver, ResolveField, Query, Mutation, Parent, Args, ID, Int, Context } from '@nestjs/graphql';
import { PostType, PostStatus, PostCommentStatus } from '@/common/helpers/enums';
import { createMetaResolver } from '@/common/resolvers/meta.resolver';
import { Fields, ResolveTree } from '@/common/decorators/field.decorator';
import { Authorized } from '@/common/decorators/authorized.decorator';
import { PostDataSource, UserDataSource } from '@/sequelize-datasources/datasources';

// Typs
import { SimpleUser } from '@/users/models/user.model';
import { PagedPostArgs } from './dto/paged-post.args';
import { NewPostInput } from './dto/new-post.input';
import { NewPostMetaInput } from './dto/new-post-meta.input';
import { UpdatePostInput } from './dto/update-post.input';
import {
  Post,
  PagedPost,
  PostStatusCount,
  PostMeta,
  PostDayCount,
  PostMonthCount,
  PostYearCount,
} from './models/post.model';

@Resolver(() => Post)
export class PostResolver extends createMetaResolver(Post, PostMeta, NewPostMetaInput, PostDataSource, {
  description: '文章',
}) {
  constructor(
    protected readonly moduleRef: ModuleRef,
    private readonly postDataSource: PostDataSource,
    private readonly userDataSource: UserDataSource,
  ) {
    super(moduleRef);
  }

  @Query((returns) => Post, { nullable: true, description: '获取文章' })
  post(
    @Args('id', { type: () => ID, description: 'Post id' }) id: number,
    @Fields() fields: ResolveTree,
  ): Promise<Post | null> {
    return this.postDataSource.get(id, PostType.Post, this.getFieldNames(fields.fieldsByTypeName.Post));
  }

  @Authorized()
  @Query((returns) => Post, { nullable: true, description: '获取编辑文章（在原有数据上创建副本进行编辑）' })
  duplicatePost(
    @Args('id', { type: () => ID, description: 'Post id' }) id: number,
    @Context('user') requestUser: JwtPayload,
  ) {
    return this.postDataSource.getDuplicate(id, PostType.Post, requestUser);
  }

  @Query((returns) => PagedPost, { description: '获取分页文章列表' })
  posts(@Args() args: PagedPostArgs, @Fields() fields: ResolveTree) {
    return this.postDataSource.getPaged(
      args,
      PostType.Post,
      this.getFieldNames(fields.fieldsByTypeName.PagedPost.rows.fieldsByTypeName.Post),
    );
  }

  @Query((returns) => [PostStatusCount], { description: '获取文章按状态分组数量' })
  postCountByStatus() {
    return this.postDataSource.getCountByStatus(PostType.Post);
  }

  @Query((returns) => [PostDayCount], { description: '获取文章按天分组数量' })
  postCountByDay(@Args('month', { description: '月份，格式：yyyyMM' }) month: string) {
    return this.postDataSource.getCountByDay(month, PostType.Post);
  }

  @Query((returns) => [PostMonthCount], { description: '获取文章按月分组数量' })
  postCountByMonth(
    @Args('year', { type: () => String, nullable: true, description: '年份，格式：yyyy' }) year: string | undefined,
    @Args('months', {
      type: () => Int,
      nullable: true,
      description: '从当前日期向前推多少个月(如果year有值则忽略)，默认：12',
    })
    months: number | undefined,
  ) {
    return this.postDataSource.getCountByMonth({ year, months }, PostType.Post);
  }

  @Query((returns) => [PostYearCount], { description: '获取文章按年分组数量' })
  postCountByYear() {
    return this.postDataSource.getCountByYear(PostType.Post);
  }

  @ResolveField((returns) => SimpleUser, { nullable: true, description: '作者' })
  author(
    @Parent() { author: authorId }: { author: number },
    @Fields() fields: ResolveTree,
  ): Promise<SimpleUser | null> {
    return this.userDataSource.getSimpleInfo(authorId, this.getFieldNames(fields.fieldsByTypeName.SimpleUser));
  }

  @Authorized()
  @Mutation((returns) => Post, { description: '添加文章' })
  addPost(
    @Args('model', { type: () => NewPostInput }) model: NewPostInput,
    @Context('user') requestUser: JwtPayload,
  ): Promise<Post> {
    return this.postDataSource.create(model, PostType.Post, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: '修改文章（Trash 状态下不支持修改）' })
  modifyPost(
    @Args('id', { type: () => ID, description: 'Post id/副本 Post id' }) id: number,
    @Args('model', { type: () => UpdatePostInput }) model: UpdatePostInput,
    @Context('user') requestUser: JwtPayload,
  ): Promise<boolean> {
    return this.postDataSource.update(id, model, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: '修改文章评论状态' })
  modifyPostCommentStatus(
    @Args('id', { type: () => ID, description: 'Post id/副本 Post id' }) id: number,
    @Args('status', { type: () => PostCommentStatus, description: '评论状态' }) status: PostCommentStatus,
    @Context('user') requestUser: JwtPayload,
  ): Promise<boolean> {
    return this.postDataSource.updateCommentStatus(id, status, requestUser);
  }

  // Page 状共用以下方法
  @Mutation((returns) => Boolean, { description: '修改文章或页面状态（Trash 状态下不支持修改）' })
  modifyPostOrPageStatus(
    @Args('id', { type: () => ID, description: 'Post/Page id' }) id: number,
    @Args('status', { type: () => PostStatus, description: '状态' }) status: PostStatus,
    @Context('user') requestUser: JwtPayload,
  ): Promise<boolean> {
    return this.postDataSource.updateStatus(id, status, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: '批量修改文章或页面状态（Trash 状态下不支持修改）' })
  blukModifyPostOrPageStatus(
    @Args('ids', { type: () => [ID!], description: 'Post/Page ids' }) ids: number[],
    @Args('status', { type: () => PostStatus, description: '状态' }) status: PostStatus,
  ): Promise<boolean> {
    return this.postDataSource.blukUpdateStatus(ids, status);
  }

  @Authorized()
  @Mutation((returns) => Boolean, {
    description: '重置文章或页面成移入到 Trash 之前状态（历史状态不存在或数据结构异常，会造成重置不成功）',
  })
  restorePostOrPage(
    @Args('id', { type: () => ID, description: 'Post/Page id' }) id: number,
    @Context('user') requestUser: JwtPayload,
  ): Promise<boolean> {
    return this.postDataSource.restore(id, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, {
    description: '批量重置文章或页面成移入到 Trash 之前状态',
  })
  blukRestorePostOrPage(
    @Args('ids', { type: () => [ID!], description: 'Post/Page ids' }) ids: number[],
  ): Promise<boolean> {
    return this.postDataSource.blukRestore(ids);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: '删除文章或页面（非 Trash 状态下无法删除）' })
  removePostOrPage(
    @Args('id', { type: () => ID, description: 'Post/Page id' }) id: number,
    @Context('user') requestUser: JwtPayload,
  ): Promise<boolean> {
    return this.postDataSource.delete(id, requestUser);
  }
}
