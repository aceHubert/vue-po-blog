import DataLoader from 'dataloader';
import { ModuleRef } from '@nestjs/core';
import { Resolver, ResolveField, Query, Mutation, Parent, Args, ID, Int } from '@nestjs/graphql';
import { TermTaxonomy as TermTaxonomyEnum } from '@/common/utils/term-taxonomy.util';
import { createMetaResolver } from '@/common/resolvers/meta.resolver';
import { Fields, ResolveTree } from '@/common/decorators/field.decorator';
import { Authorized } from '@/common/decorators/authorized.decorator';
import { User } from '@/common/decorators/user.decorator';
import { PostType } from '@/orm-entities/interfaces';

// Types
import { PostDataSource, UserDataSource, TermDataSource } from '@/sequelize-datasources/datasources';
import { UserSimpleModel, TermTaxonomyModel } from '@/sequelize-datasources/interfaces';
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
  private authorLoader!: DataLoader<{ authorId: number; fields: string[] }, UserSimpleModel>;
  private categoryLoader!: DataLoader<
    { objectId: number; taxonomy: TermTaxonomyEnum; fields: string[] },
    TermTaxonomyModel[]
  >;
  private tagLoader!: DataLoader<
    { objectId: number; taxonomy: TermTaxonomyEnum; fields: string[] },
    TermTaxonomyModel[]
  >;

  constructor(
    protected readonly moduleRef: ModuleRef,
    private readonly postDataSource: PostDataSource,
    private readonly userDataSource: UserDataSource,
    private readonly termDataSource: TermDataSource,
  ) {
    super(moduleRef);
    this.authorLoader = new DataLoader(async (keys) => {
      if (keys.length) {
        // 所有调用的 fields 都是相同的
        const results = await this.userDataSource.getSimpleInfo(
          keys.map((key) => key.authorId),
          keys[0].fields,
        );
        return keys.map(({ authorId }) => results[authorId] || new Error(`No result for ${authorId}`));
      } else {
        return Promise.resolve([]);
      }
    });
    const termLoaderFn = async (
      keys: Readonly<Array<{ objectId: number; taxonomy: TermTaxonomyEnum; fields: string[] }>>,
    ) => {
      if (keys.length) {
        // 所有调用的 taxonomy 和 fields 都是相同的
        const results = await this.termDataSource.getListByObjectId(
          keys.map((key) => key.objectId),
          keys[0].taxonomy,
          keys[0].fields,
        );
        return keys.map(({ objectId }) => results[objectId] || []);
      } else {
        return Promise.resolve([]);
      }
    };
    this.categoryLoader = new DataLoader(termLoaderFn);
    this.tagLoader = new DataLoader(termLoaderFn);
  }

  @Query((returns) => Post, { nullable: true, description: 'Get post.' })
  post(
    @Args('id', { type: () => ID, description: 'Post id' }) id: number,
    @Fields() fields: ResolveTree,
    @User() requestUser?: RequestUser,
  ): Promise<Post | undefined> {
    return this.postDataSource.get(id, PostType.Post, this.getFieldNames(fields.fieldsByTypeName.Post), requestUser);
  }

  @Query((returns) => PagedPost, { description: 'Get paged posts.' })
  posts(@Args() args: PagedPostArgs, @Fields() fields: ResolveTree, @User() requestUser?: RequestUser) {
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
    return this.authorLoader.load({ authorId, fields: this.getFieldNames(fields.fieldsByTypeName.SimpleUser) });
  }

  @ResolveField((returns) => [TermTaxonomy!], { description: 'Categories' })
  categories(@Parent() { id: objectId }: { id: number }, @Fields() fields: ResolveTree) {
    return this.categoryLoader.load({
      objectId,
      taxonomy: TermTaxonomyEnum.Category,
      fields: this.getFieldNames(fields.fieldsByTypeName.TermTaxonomy),
    });
  }

  @ResolveField((returns) => [TermTaxonomy!], { description: 'Tags' })
  tags(@Parent() { id: objectId }: { id: number }, @Fields() fields: ResolveTree) {
    return this.tagLoader.load({
      objectId,
      taxonomy: TermTaxonomyEnum.Tag,
      fields: this.getFieldNames(fields.fieldsByTypeName.TermTaxonomy),
    });
  }

  @Authorized()
  @Query((returns) => [PostStatusCount], {
    description: "Get post count by status (include other's Posts, depends on your role).",
  })
  postCountByStatus(@User() requestUser: RequestUser) {
    return this.postDataSource.getCountByStatus(PostType.Post, requestUser);
  }

  @Authorized()
  @Query((returns) => Int, { description: "Get yourself's post count" })
  postCountBySelf(@User() requestUser: RequestUser) {
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
    @User() requestUser: RequestUser,
  ): Promise<Post> {
    return this.postDataSource.create(model, PostType.Post, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Update post (not allow to update in "trash" status).' })
  updatePost(
    @Args('id', { type: () => ID, description: 'Post id/副本 Post id' }) id: number,
    @Args('model', { type: () => UpdatePostInput }) model: UpdatePostInput,
    @User() requestUser: RequestUser,
  ): Promise<boolean> {
    return this.postDataSource.update(id, model, requestUser);
  }

  // Page 状共用以下方法
  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Update post stauts (not allow to update in "trash" status)' })
  updatePostStatus(
    @Args('id', { type: () => ID, description: 'Post id' }) id: number,
    @Args('status', { type: () => PostStatus, description: 'Status' }) status: PostStatus,
    @User() requestUser: RequestUser,
  ): Promise<boolean> {
    return this.postDataSource.updateStatus(id, status, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, {
    description: 'Update bulk of posts status (not allow to update in "trash" status)',
  })
  bulkUpdatePostStatus(
    @Args('ids', { type: () => [ID!], description: 'Post/Page ids' }) ids: number[],
    @Args('status', { type: () => PostStatus, description: 'Status' }) status: PostStatus,
    @User() requestUser: RequestUser,
  ): Promise<boolean> {
    return this.postDataSource.bulkUpdateStatus(ids, status, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Update comment status' })
  updatePostCommentStatus(
    @Args('id', { type: () => ID, description: 'Post id' }) id: number,
    @Args('status', { type: () => PostCommentStatus, description: 'Comment status' }) status: PostCommentStatus,
    @User() requestUser: RequestUser,
  ): Promise<boolean> {
    return this.postDataSource.updateCommentStatus(id, status, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Restore post from trash' })
  restorePost(
    @Args('id', { type: () => ID, description: 'Post/Page id' }) id: number,
    @User() requestUser: RequestUser,
  ): Promise<boolean> {
    return this.postDataSource.restore(id, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Restore bulk of post from trash' })
  bulkRestorePost(
    @Args('ids', { type: () => [ID!], description: 'Post/Page ids' }) ids: number[],
    @User() requestUser: RequestUser,
  ): Promise<boolean> {
    return this.postDataSource.bulkRestore(ids, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Delete post permanently (must be in "trash" status).' })
  deletePost(
    @Args('id', { type: () => ID, description: 'Post id' }) id: number,
    @User() requestUser: RequestUser,
  ): Promise<boolean> {
    return this.postDataSource.delete(id, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Delete bulk of posts permanently (must be in "trash" status).' })
  bulkDeletePost(
    @Args('ids', { type: () => [ID!], description: 'Post ids' }) ids: number[],
    @User() requestUser: RequestUser,
  ): Promise<boolean> {
    return this.postDataSource.bulkDelete(ids, requestUser);
  }
}
