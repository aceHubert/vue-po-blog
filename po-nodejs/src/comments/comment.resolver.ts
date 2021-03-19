import { ModuleRef } from '@nestjs/core';
import { Resolver, ResolveField, Query, Mutation, Root, Args, ID, Context } from '@nestjs/graphql';
import { createMetaResolver } from '@/common/resolvers/meta.resolver';
import { Fields, ResolveTree } from '@/common/decorators/field.decorator';
import { Authorized } from '~/common/decorators/authorized.decorator';
import { CommentDataSource, UserDataSource } from '@/sequelize-datasources/datasources';

// Types
import { User } from '@/users/models/user.model';
import { PagedCommentArgs, PagedCommentChildrenArgs } from './dto/paged-comment.args';
import { NewCommentInput } from './dto/new-comment.input';
import { NewCommentMetaInput } from './dto/new-comment-meta.input';
// import { UpdateCommentInput } from './dto/update-comment.input';
import { Comment, PagedComment, CommentMeta } from './models/comment.model';

@Resolver(() => Comment)
export class CommentResolver extends createMetaResolver(Comment, CommentMeta, NewCommentMetaInput, CommentDataSource, {
  name: '文章评论',
}) {
  constructor(
    protected readonly moduleRef: ModuleRef,
    private readonly commentDataSource: CommentDataSource,
    private readonly userDataSoruce: UserDataSource,
  ) {
    super(moduleRef);
  }

  @Query((returns) => Comment, { nullable: true, description: '获取评论' })
  comment(@Args('id', { type: () => ID! }) id: number, @Fields() fields: ResolveTree) {
    let fixFields = this.getFieldNames(fields.fieldsByTypeName.Comment);
    if (fixFields.includes('user')) {
      fixFields = ['userId'].concat(fixFields);
    }
    if (fixFields.includes('children') && !fixFields.includes('id')) {
      fixFields = ['id'].concat(fixFields);
    }

    return this.commentDataSource.get(id, fixFields);
  }

  @Query((returns) => PagedComment, { description: '获取评论分页列表' })
  comments(@Args() args: PagedCommentArgs, @Fields() fields: ResolveTree) {
    return this.commentDataSource.getPaged(
      args,
      this.getFieldNames(fields.fieldsByTypeName.PagedComment.rows.fieldsByTypeName.Comment),
    );
  }

  @ResolveField((returns) => PagedComment, { description: '回复的评论（分页）' })
  children(
    @Args() args: PagedCommentChildrenArgs,
    @Root() { id: parentId }: { id: number },
    @Fields() fields: ResolveTree,
  ) {
    const fixArgs: Omit<PagedCommentArgs, 'postId'> = {
      ...args,
      parentId,
    };
    return this.commentDataSource.getPaged(
      fixArgs,
      this.getFieldNames(fields.fieldsByTypeName.PagedComment.rows.fieldsByTypeName.Comment),
    );
  }

  @Authorized()
  @ResolveField((returns) => User, { nullable: true, description: '评论用户' })
  user(
    @Root() { userId }: { userId: number },
    @Fields() fields: ResolveTree,
    @Context('user') requestUser: JwtPayload,
  ) {
    return this.userDataSoruce.get(userId, this.getFieldNames(fields.fieldsByTypeName.User), requestUser);
  }

  @Mutation((returns) => Comment, {
    nullable: true,
    description: '添加评论',
  })
  addComment(@Args('model', { type: () => NewCommentInput }) model: NewCommentInput) {
    return this.commentDataSource.create(model);
  }
}
