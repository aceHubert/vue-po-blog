import { ModuleRef } from '@nestjs/core';
import { Resolver, ResolveField, Query, Mutation, Parent, Args, ID, Int } from '@nestjs/graphql';
import { TermTaxonomy as TermTaxonomyEnum } from '@/common/utils/term-taxonomy.util';
import { createMetaResolver } from '@/common/resolvers/meta.resolver';
import { Fields, ResolveTree } from '@/common/decorators/field.decorator';
import { Authorized } from '@/common/decorators/authorized.decorator';
import { User } from '@/common/decorators/user.decorator';
import { PostType } from '@/orm-entities/interfaces';
import { PostDataSource, UserDataSource, TermDataSource } from '@/sequelize-datasources/datasources';

// Typs
import { SimpleUser } from '@/users/models/user.model';
import { TermTaxonomy } from '@/terms/models/term.model';
import { PostStatus, PostCommentStatus } from './enums';
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
  descriptionName: 'post',
}) {
  constructor(
    protected readonly moduleRef: ModuleRef,
    private readonly postDataSource: PostDataSource,
    private readonly userDataSource: UserDataSource,
    private readonly termDataSource: TermDataSource,
  ) {
    super(moduleRef);
  }

  @Query((returns) => Post, { nullable: true, description: 'Get post.' })
  post(
    @Args('id', { type: () => ID, description: 'Post id' }) id: number,
    @Fields() fields: ResolveTree,
    @User() requestUser?: JwtPayloadWithLang,
  ): Promise<Post | null> {
    return this.postDataSource.get(id, PostType.Post, this.getFieldNames(fields.fieldsByTypeName.Post), requestUser);
  }

  @Query((returns) => PagedPost, { description: 'Get paged posts.' })
  posts(@Args() args: PagedPostArgs, @Fields() fields: ResolveTree, @User() requestUser?: JwtPayloadWithLang) {
    return this.postDataSource.getPaged(
      args,
      PostType.Post,
      this.getFieldNames(fields.fieldsByTypeName.PagedPost.rows.fieldsByTypeName.Post),
      requestUser,
    );
  }

  @ResolveField((returns) => SimpleUser, { nullable: true, description: 'Author info' })
  author(
    @Parent() { author: authorId }: { author: number },
    @Fields() fields: ResolveTree,
  ): Promise<SimpleUser | null> {
    return this.userDataSource.getSimpleInfo(authorId, this.getFieldNames(fields.fieldsByTypeName.SimpleUser));
  }

  @ResolveField((returns) => [TermTaxonomy!], { description: 'Categories' })
  categories(
    @Args('parentId', {
      type: () => ID,
      nullable: true,
      description: 'Parent id (it will search for all if none value is provided, 0 is root parent id)',
    })
    parentId: number | undefined,
    @Args('desc', { type: () => Boolean, nullable: true, description: 'Sort (default: asc)' })
    desc: boolean | undefined,
    @Parent() { id }: { id: number },
    @Fields() fields: ResolveTree,
  ) {
    return this.termDataSource.getListByObjectId(
      { objectId: id, taxonomy: TermTaxonomyEnum.Category, parentId, desc },
      this.getFieldNames(fields.fieldsByTypeName.TermTaxonomy),
    );
  }

  @ResolveField((returns) => [TermTaxonomy!], { description: 'Tags' })
  tags(
    @Args('desc', { type: () => Boolean, nullable: true, description: 'Sort (default: asc)' })
    desc: boolean | undefined,
    @Parent() { id }: { id: number },
    @Fields() fields: ResolveTree,
  ) {
    return this.termDataSource.getListByObjectId(
      { objectId: id, taxonomy: TermTaxonomyEnum.Tag, desc },
      this.getFieldNames(fields.fieldsByTypeName.TermTaxonomy),
    );
  }

  @Authorized()
  @Query((returns) => [PostStatusCount], {
    description: "Get post count by status (include other's Posts, depends on your role).",
  })
  postCountByStatus(@User() requestUser: JwtPayloadWithLang) {
    return this.postDataSource.getCountByStatus(PostType.Post, requestUser);
  }

  @Authorized()
  @Query((returns) => Int, { description: "Get yourself's post count" })
  postCountBySelf(@User() requestUser: JwtPayloadWithLang) {
    return this.postDataSource.getCountBySelf(PostType.Post, requestUser);
  }

  @Query((returns) => [PostDayCount], { description: 'Get post count by day.' })
  postCountByDay(@Args('month', { description: 'Month (format：yyyyMM)' }) month: string) {
    return this.postDataSource.getCountByDay(month, PostType.Post);
  }

  @Query((returns) => [PostMonthCount], { description: 'Get post count by month.' })
  postCountByMonth(
    @Args('year', { type: () => String, nullable: true, description: 'Year, (format：yyyy)' }) year: string | undefined,
    @Args('months', {
      type: () => Int,
      nullable: true,
      description: 'Latest number of months from current (default: 12)',
    })
    months: number | undefined,
  ) {
    return this.postDataSource.getCountByMonth({ year, months }, PostType.Post);
  }

  @Query((returns) => [PostYearCount], { description: 'Get post count by year.' })
  postCountByYear() {
    return this.postDataSource.getCountByYear(PostType.Post);
  }

  @Authorized()
  @Mutation((returns) => Post, { description: 'Create a new post.' })
  createPost(
    @Args('model', { type: () => NewPostInput }) model: NewPostInput,
    @User() requestUser: JwtPayload,
  ): Promise<Post> {
    return this.postDataSource.create(model, PostType.Post, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Update post (not allow to update in "trash" status).' })
  updatePost(
    @Args('id', { type: () => ID, description: 'Post id/副本 Post id' }) id: number,
    @Args('model', { type: () => UpdatePostInput }) model: UpdatePostInput,
    @User() requestUser: JwtPayload,
  ): Promise<boolean> {
    return this.postDataSource.update(id, model, requestUser);
  }

  // Page 状共用以下方法
  @Mutation((returns) => Boolean, { description: 'Update post stauts (not allow to update in "trash" status)' })
  updatePostStatus(
    @Args('id', { type: () => ID, description: 'Post id' }) id: number,
    @Args('status', { type: () => PostStatus, description: 'status' }) status: PostStatus,
    @User() requestUser: JwtPayload,
  ): Promise<boolean> {
    return this.postDataSource.updateStatus(id, status, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, {
    description: 'Update bulk of posts status (not allow to update in "trash" status)',
  })
  bulkModifyPostStatus(
    @Args('ids', { type: () => [ID!], description: 'Post/Page ids' }) ids: number[],
    @Args('status', { type: () => PostStatus, description: '状态' }) status: PostStatus,
    @User() requestUser: JwtPayload,
  ): Promise<boolean> {
    return this.postDataSource.bulkUpdateStatus(ids, status, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Update comment status' })
  updatePostCommentStatus(
    @Args('id', { type: () => ID, description: 'Post id' }) id: number,
    @Args('status', { type: () => PostCommentStatus, description: 'Comment status' }) status: PostCommentStatus,
    @User() requestUser: JwtPayload,
  ): Promise<boolean> {
    return this.postDataSource.updateCommentStatus(id, status, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Restore post from trash' })
  restorePost(
    @Args('id', { type: () => ID, description: 'Post/Page id' }) id: number,
    @User() requestUser: JwtPayload,
  ): Promise<boolean> {
    return this.postDataSource.restore(id, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Restore bulk of post from trash' })
  bulkRestorePost(
    @Args('ids', { type: () => [ID!], description: 'Post/Page ids' }) ids: number[],
    @User() requestUser: JwtPayload,
  ): Promise<boolean> {
    return this.postDataSource.bulkRestore(ids, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Delete post permanently (must be in "trash" status).' })
  deletePost(
    @Args('id', { type: () => ID, description: 'Post id' }) id: number,
    @User() requestUser: JwtPayload,
  ): Promise<boolean> {
    return this.postDataSource.delete(id, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Delete bulk of posts permanently (must be in "trash" status).' })
  bulkDeletePost(
    @Args('ids', { type: () => [ID!], description: 'Post ids' }) ids: number[],
    @User() requestUser: JwtPayload,
  ): Promise<boolean> {
    return this.postDataSource.bulkDelete(ids, requestUser);
  }
}
